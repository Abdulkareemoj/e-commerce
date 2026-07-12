import { Hono } from "hono";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { product } from "@/db/schema/product-schema";
import { order } from "@/db/schema/order-schema";
import { payout } from "@/db/schema/payout-schema";
import { eq, sql, desc, and, gte } from "drizzle-orm";

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

    // Revenue chart: last 7 days
    const now = new Date();
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = await db
        .select({ total: sql<string | null>`sum(total_amount)` })
        .from(order)
        .where(
          and(
            eq(order.status, "delivered"),
            sql`${order.createdAt} >= ${dayStart.toISOString()}`,
            sql`${order.createdAt} <= ${dayEnd.toISOString()}`,
          ),
        );

      revenueChart.push({
        date: dayStart.toISOString().split("T")[0],
        label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: parseFloat(dayRevenue[0]?.total ?? "0"),
      });
    }

    // Recent activity: latest 10 orders
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

    const recentActivity = recentOrders.map((o) => ({
      id: o.id,
      type: "order" as const,
      message: `Order #${o.id.slice(0, 8)} — $${o.totalAmount}`,
      status: o.status,
      createdAt: o.createdAt,
    }));

    return c.json({
      stats: {
        totalUsers,
        totalVendors,
        pendingVendors,
        totalProducts,
        totalOrders,
        totalRevenue: revenueResult[0]?.total ?? "0",
        pendingPayouts: pendingPayouts[0]?.count ?? 0,
        revenueChart,
        recentActivity,
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
