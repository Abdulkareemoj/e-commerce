import { Hono } from "hono";
import { db } from "@/db";
import { product } from "@/db/schema/product-schema";
import { orderItem, order } from "@/db/schema/order-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { eq, desc, and, gte, lt, sql } from "drizzle-orm";

const dashboardVendor = new Hono();

dashboardVendor.get("/stats", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const productCount = await db.$count(product, eq(product.vendorId, v.id));

    const orderItems = await db.query.orderItem.findMany({
      where: eq(orderItem.vendorId, v.id),
      with: {
        order: {
          columns: { id: true, status: true, totalAmount: true, createdAt: true },
        },
      },
      orderBy: [desc(orderItem.id)],
    });

    const totalOrders = new Set(orderItems.map((oi) => oi.orderId)).size;
    const totalRevenue = orderItems
      .filter((oi) => ["accepted", "shipped", "delivered"].includes(oi.status))
      .reduce((sum, oi) => sum + parseFloat(oi.price) * oi.quantity, 0);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentOrderItems = orderItems.filter(
      (oi) => new Date(oi.order.createdAt) >= thirtyDaysAgo
    );
    const previousOrderItems = orderItems.filter(
      (oi) =>
        new Date(oi.order.createdAt) >= sixtyDaysAgo &&
        new Date(oi.order.createdAt) < thirtyDaysAgo
    );

    const recentRevenue = recentOrderItems
      .filter((oi) => ["accepted", "shipped", "delivered"].includes(oi.status))
      .reduce((sum, oi) => sum + parseFloat(oi.price) * oi.quantity, 0);

    const previousRevenue = previousOrderItems
      .filter((oi) => ["accepted", "shipped", "delivered"].includes(oi.status))
      .reduce((sum, oi) => sum + parseFloat(oi.price) * oi.quantity, 0);

    const revenueGrowth =
      previousRevenue > 0
        ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)
        : recentRevenue > 0
          ? 100
          : 0;

    const recentOrdersMap = new Map<string, any>();
    for (const oi of orderItems) {
      if (!recentOrdersMap.has(oi.orderId)) {
        recentOrdersMap.set(oi.orderId, {
          id: oi.order.id,
          status: oi.order.status,
          totalAmount: oi.order.totalAmount,
          createdAt: oi.order.createdAt,
        });
      }
    }
    const recentOrders = Array.from(recentOrdersMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const lowStockCount = await db.$count(
      product,
      and(eq(product.vendorId, v.id), eq(product.isAvailable, true), lt(product.stock, 10))
    );

    return c.json({
      stats: {
        totalProducts: productCount,
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        revenueGrowth,
        lowStockCount,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

export default dashboardVendor;
