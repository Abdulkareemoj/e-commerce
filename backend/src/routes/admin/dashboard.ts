import { Hono } from "hono";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { product } from "@/db/schema/product-schema";
import { order } from "@/db/schema/order-schema";
import { payout } from "@/db/schema/payout-schema";
import { eq, sql, desc } from "drizzle-orm";

const dashboardRoutes = new Hono();

dashboardRoutes.get("/stats", async (c) => {
  try {
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user);

    const [{ count: totalVendors }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(vendor)
      .where(eq(vendor.isVerified, "approved"));

    const [{ count: pendingVendors }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(vendor)
      .where(eq(vendor.isVerified, "pending"));

    const [{ count: totalProducts }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(product);

    const [{ count: totalOrders }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(order);

    const revenueResult = await db
      .select({ total: sql<string | null>`sum(total_amount)` })
      .from(order)
      .where(eq(order.status, "delivered"));

    const pendingPayouts = await db
      .select({ count: sql<number>`count(*)` })
      .from(payout)
      .where(eq(payout.status, "pending"));

    return c.json({
      stats: {
        totalUsers,
        totalVendors,
        pendingVendors,
        totalProducts,
        totalOrders,
        totalRevenue: revenueResult[0]?.total ?? "0",
        pendingPayouts: pendingPayouts[0]?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

dashboardRoutes.get("/recent-activity", async (c) => {
  try {
    const recentOrders = await db
      .select({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      })
      .from(order)
      .orderBy(desc(order.createdAt))
      .limit(10);

    return c.json({ recentOrders });
  } catch (error) {
    console.error("Recent activity error:", error);
    return c.json({ error: "Failed to fetch activity" }, 500);
  }
});

export default dashboardRoutes;
