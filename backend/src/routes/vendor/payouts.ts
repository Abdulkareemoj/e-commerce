import { Hono } from "hono";
import { db } from "@/db";
import { payout } from "@/db/schema/payout-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { eq, desc } from "drizzle-orm";

const payoutsVendor = new Hono();

payoutsVendor.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const payouts = await db.query.payout.findMany({
      where: eq(payout.vendorId, v.id),
      orderBy: [desc(payout.requestedAt)],
    });

    return c.json({ payouts });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return c.json({ error: "Failed to fetch payouts" }, 500);
  }
});

payoutsVendor.post("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const body = await c.req.json();
    if (!body.amount || body.amount <= 0) {
      return c.json({ error: "Valid amount is required" }, 400);
    }

    const newPayout = await db
      .insert(payout)
      .values({
        id: crypto.randomUUID(),
        vendorId: v.id,
        amount: body.amount,
        note: body.note || null,
        status: "pending",
      })
      .returning();

    return c.json({ payout: newPayout[0] }, 201);
  } catch (error) {
    console.error("Error requesting payout:", error);
    return c.json({ error: "Failed to request payout" }, 500);
  }
});

export default payoutsVendor;
