import { Hono } from "hono";
import { db } from "@/db";
import { order, orderItem } from "@/db/schema/order-schema";
import { product } from "@/db/schema/product-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { createNotification } from "@/utils/notifications";

const ordersVendor = new Hono();

ordersVendor.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const items = await db.query.orderItem.findMany({
      where: eq(orderItem.vendorId, v.id),
      orderBy: [desc(orderItem.id)],
      with: {
        order: {
          with: {
            user: {
              columns: { id: true, name: true, email: true },
            },
          },
        },
        product: {
          columns: { id: true, name: true, images: true },
        },
      },
    });

    const grouped: Record<string, any> = {};
    for (const item of items) {
      const oid = item.orderId;
      if (!grouped[oid]) {
        grouped[oid] = {
          id: item.order.id,
          status: item.order.status,
          totalAmount: item.order.totalAmount,
          trackingNumber: item.order.trackingNumber,
          createdAt: item.order.createdAt,
          user: item.order.user,
          items: [],
        };
      }
      grouped[oid].items.push({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || "Unknown",
        productImage: item.product?.images?.[0] || null,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        variantSnapshot: item.variantSnapshot,
      });
    }

    return c.json({ orders: Object.values(grouped) });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

ordersVendor.get("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const oid = c.req.param("id");
    const ord = await db.query.order.findFirst({
      where: eq(order.id, oid),
      with: {
        user: { columns: { id: true, name: true, email: true } },
        items: {
          where: eq(orderItem.vendorId, v.id),
          with: {
            product: { columns: { id: true, name: true, images: true } },
          },
        },
      },
    });

    if (!ord) return c.json({ error: "Order not found" }, 404);

    return c.json({ order: ord });
  } catch (error) {
    console.error("Error fetching vendor order:", error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

ordersVendor.put("/items/:itemId/status", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const itemId = c.req.param("itemId");
    const body = await c.req.json();
    const validStatuses = ["pending", "accepted", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(body.status)) {
      return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, 400);
    }

    const existing = await db.query.orderItem.findFirst({
      where: and(eq(orderItem.id, itemId), eq(orderItem.vendorId, v.id)),
    });

    if (!existing) return c.json({ error: "Order item not found" }, 404);

    await db
      .update(orderItem)
      .set({ status: body.status })
      .where(eq(orderItem.id, itemId));

    const updated = await db.query.orderItem.findFirst({
      where: eq(orderItem.id, itemId),
      with: {
        product: { columns: { id: true, name: true } },
      },
    });

    const ord = await db.query.order.findFirst({
      where: eq(order.id, existing.orderId),
      columns: { userId: true },
    });

    if (ord) {
      await createNotification({
        userId: ord.userId,
        type: `order_${body.status}`,
        title: `Order ${body.status}`,
        body: `Your item "${updated?.product?.name || "Product"}" has been ${body.status}.`,
        data: { orderId: existing.orderId, itemId, status: body.status },
      });
    }

    return c.json({ item: updated });
  } catch (error) {
    console.error("Error updating order item status:", error);
    return c.json({ error: "Failed to update status" }, 500);
  }
});

export default ordersVendor;
