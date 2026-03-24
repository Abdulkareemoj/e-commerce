import { Hono } from "hono";
import { db } from "@/db";
import { order, orderItem } from "@/db/schema/order-schema";
import { product } from "@/db/schema/product-schema";
import { eq, inArray, desc, and } from "drizzle-orm";

const ordersUser = new Hono();

ordersUser.get("/", async (c) => {
  const user = (c as any).get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const userOrders = await db.select()
      .from(order)
      .where(eq(order.userId, user.id))
      .orderBy(desc(order.createdAt));
      
    // Optionally fetch items for each order, but for a list view just the orders is fine
    return c.json({ orders: userOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

ordersUser.post("/", async (c) => {
  const user = (c as any).get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  
  if (!body.items || body.items.length === 0) {
    return c.json({ error: "No items in order" }, 400);
  }

  try {
    const totalAmount = body.items.reduce((sum: number, item: any) => sum + (item.priceCents * item.qty) / 100, 0);
    const orderId = crypto.randomUUID(); 

    await db.insert(order).values({
      id: orderId,
      userId: user.id,
      status: "pending",
      totalAmount: totalAmount.toString(),
    });

    const productIds = body.items.map((i: any) => i.productId);
    const productsInDb = await db.select({ id: product.id, vendorId: product.vendorId }).from(product).where(inArray(product.id, productIds));
    const productMap = new Map(productsInDb.map(p => [p.id, p]));

    const orderItemsToInsert = body.items.map((item: any) => {
      const dbProd = productMap.get(item.productId);
      if (!dbProd) throw new Error(`Product ${item.productId} not found`);
      
      return {
        id: crypto.randomUUID(),
        orderId: orderId,
        productId: item.productId,
        vendorId: dbProd.vendorId, 
        quantity: item.qty,
        price: (item.priceCents / 100).toFixed(2),
      };
    });

    await db.insert(orderItem).values(orderItemsToInsert);

    return c.json({ message: "Order created successfully", orderId }, 201);
  } catch (error) {
    console.error("Order creation failed", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

export default ordersUser;
