import { Hono } from "hono";
import { db } from "@/db";
import { order, orderItem } from "@/db/schema/order-schema";
import { user } from "@/db/schema/auth-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { product } from "@/db/schema/product-schema";
import { eq, desc, sql, and } from "drizzle-orm";

const ordersRoutes = new Hono();

ordersRoutes.get("/list", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const status = c.req.query("status");
    const search = c.req.query("search");

    const conditions = [];
    if (status) {
      conditions.push(eq(order.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(order)
      .where(where);

    const orders = await db
      .select({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        userName: user.name,
        userEmail: user.email,
        itemCount: sql<number>`(
          SELECT count(*)::int FROM ${orderItem}
          WHERE ${orderItem.orderId} = ${order.id}
        )`,
      })
      .from(order)
      .leftJoin(user, eq(order.userId, user.id))
      .where(where)
      .orderBy(desc(order.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return c.json({ orders, total: count, page, limit });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

ordersRoutes.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();

    const rows = await db
      .select({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber,
        couponCode: order.couponCode,
        discountCents: order.discountCents,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(order)
      .leftJoin(user, eq(order.userId, user.id))
      .where(eq(order.id, id))
      .limit(1);

    if (!rows.length) return c.json({ error: "Order not found" }, 404);

    const items = await db
      .select({
        id: orderItem.id,
        quantity: orderItem.quantity,
        price: orderItem.price,
        status: orderItem.status,
        variantSnapshot: orderItem.variantSnapshot,
        productId: orderItem.productId,
        productName: product.name,
        storeName: vendor.storeName,
      })
      .from(orderItem)
      .leftJoin(product, eq(orderItem.productId, product.id))
      .leftJoin(vendor, eq(orderItem.vendorId, vendor.id))
      .where(eq(orderItem.orderId, id));

    return c.json({ order: { ...rows[0], items } });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

ordersRoutes.put("/:id/status", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
    if (!validStatuses.includes(body.status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const found = await db.select().from(order).where(eq(order.id, id)).limit(1);
    if (!found.length) return c.json({ error: "Order not found" }, 404);

    const historyEntry = JSON.stringify({
      status: body.status,
      timestamp: new Date().toISOString(),
      note: body.note || "",
    });

    const existingHistory = found[0].statusHistory
      ? JSON.parse(found[0].statusHistory)
      : [];
    existingHistory.push(JSON.parse(historyEntry));

    await db
      .update(order)
      .set({
        status: body.status,
        statusHistory: JSON.stringify(existingHistory),
        trackingNumber: body.trackingNumber ?? found[0].trackingNumber,
        updatedAt: new Date(),
      })
      .where(eq(order.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update order:", error);
    return c.json({ error: "Failed to update order" }, 500);
  }
});

export default ordersRoutes;
