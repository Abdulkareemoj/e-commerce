import { Hono } from "hono";
import { db } from "@/db";
import { vendor } from "@/db/schema/vendor-schema";
import { eq } from "drizzle-orm";

const storeVendor = new Hono();

storeVendor.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    return c.json({
      store: {
        id: v.id,
        storeName: v.storeName,
        storeSlug: v.storeSlug,
        description: v.description,
        payoutDetails: v.payoutDetails,
        isVerified: v.isVerified,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching store:", error);
    return c.json({ error: "Failed to fetch store" }, 500);
  }
});

storeVendor.put("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const body = await c.req.json();
    const updates: Record<string, any> = {};

    if (body.storeName !== undefined) updates.storeName = body.storeName;
    if (body.storeSlug !== undefined) updates.storeSlug = body.storeSlug;
    if (body.description !== undefined) updates.description = body.description;
    if (body.payoutDetails !== undefined) updates.payoutDetails = body.payoutDetails;
    updates.updatedAt = new Date();

    await db.update(vendor).set(updates).where(eq(vendor.id, v.id));

    const updated = await db.query.vendor.findFirst({
      where: eq(vendor.id, v.id),
    });

    return c.json({ store: updated });
  } catch (error: any) {
    if (error?.code === "23505") {
      return c.json({ error: "Store slug is already taken" }, 409);
    }
    console.error("Error updating store:", error);
    return c.json({ error: "Failed to update store" }, 500);
  }
});

export default storeVendor;
