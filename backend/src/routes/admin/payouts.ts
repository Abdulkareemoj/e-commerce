import { Hono } from "hono";
import { db } from "@/db";
import { payout } from "@/db/schema/payout-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { eq, desc, and, sql } from "drizzle-orm";

const payoutsRoutes = new Hono();

payoutsRoutes.get("/list", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const status = c.req.query("status");

    const conditions = [];
    if (status) {
      conditions.push(eq(payout.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(payout)
      .where(where);

    const payouts = await db
      .select({
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
        note: payout.note,
        requestedAt: payout.requestedAt,
        processedAt: payout.processedAt,
        vendorId: vendor.id,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
      })
      .from(payout)
      .leftJoin(vendor, eq(payout.vendorId, vendor.id))
      .where(where)
      .orderBy(desc(payout.requestedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return c.json({ payouts, total: count, page, limit });
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return c.json({ error: "Failed to fetch payouts" }, 500);
  }
});

payoutsRoutes.put("/:id/process", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    if (!["approved", "rejected"].includes(body.status)) {
      return c.json({ error: "Status must be approved or rejected" }, 400);
    }

    const found = await db.select().from(payout).where(eq(payout.id, id)).limit(1);
    if (!found.length) return c.json({ error: "Payout not found" }, 404);

    if (found[0].status !== "pending") {
      return c.json({ error: `Payout is already ${found[0].status}` }, 400);
    }

    await db
      .update(payout)
      .set({
        status: body.status,
        note: body.note ?? found[0].note,
        processedAt: body.status === "approved" ? new Date() : null,
      })
      .where(eq(payout.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to process payout:", error);
    return c.json({ error: "Failed to process payout" }, 500);
  }
});

export default payoutsRoutes;
