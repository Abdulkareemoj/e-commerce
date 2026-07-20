import { Hono } from "hono";
import { db } from "@/db";
import { coupon } from "@/db/schema/coupon-schema";
import { eq, desc } from "drizzle-orm";

const couponAdminRoutes = new Hono();

function validateDiscount(body: any) {
  if (!["percentage", "fixed"].includes(body.discountType)) {
    return "discountType must be 'percentage' or 'fixed'";
  }
  if (body.discountType === "percentage") {
    const pct = Number(body.discountPercent);
    if (body.discountPercent === undefined || isNaN(pct) || pct <= 0 || pct > 100) {
      return "discountPercent must be a number between 0 and 100";
    }
    if (body.discountAmount !== undefined && body.discountAmount !== null) {
      return "discountAmount must not be set for a percentage coupon";
    }
  } else {
    const amt = Number(body.discountAmount);
    if (body.discountAmount === undefined || isNaN(amt) || amt <= 0) {
      return "discountAmount must be a positive number";
    }
    if (body.discountPercent !== undefined && body.discountPercent !== null) {
      return "discountPercent must not be set for a fixed coupon";
    }
  }
  return null;
}

couponAdminRoutes.get("/", async (c) => {
  try {
    const coupons = await db.query.coupon.findMany({ orderBy: [desc(coupon.createdAt)] });
    return c.json({ coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return c.json({ error: "Failed to fetch coupons" }, 500);
  }
});

couponAdminRoutes.get("/:id", async (c) => {
  try {
    const found = await db.query.coupon.findFirst({ where: eq(coupon.id, c.req.param("id")) });
    if (!found) return c.json({ error: "Coupon not found" }, 404);
    return c.json({ coupon: found });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return c.json({ error: "Failed to fetch coupon" }, 500);
  }
});

couponAdminRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.code || !body.discountType) {
      return c.json({ error: "code and discountType are required" }, 400);
    }

    const discountError = validateDiscount(body);
    if (discountError) return c.json({ error: discountError }, 400);

    const id = crypto.randomUUID();
    await db.insert(coupon).values({
      id,
      code: body.code.toUpperCase(),
      description: body.description || null,
      discountType: body.discountType,
      discountPercent: body.discountType === "percentage" ? body.discountPercent : null,
      discountAmount: body.discountType === "fixed" ? body.discountAmount : null,
      minimumOrderAmount: body.minimumOrderAmount ?? "0",
      maxUses: body.maxUses || 0,
      currentUses: 0,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive !== false,
      productId: body.productId || null,
      categoryId: body.categoryId || null,
      vendorId: body.vendorId || null,
    });

    const created = await db.query.coupon.findFirst({ where: eq(coupon.id, id) });
    return c.json({ coupon: created }, 201);
  } catch (error) {
    console.error("Error creating coupon:", error);
    return c.json({ error: "Failed to create coupon" }, 500);
  }
});

couponAdminRoutes.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const existing = await db.query.coupon.findFirst({ where: eq(coupon.id, id) });
    if (!existing) return c.json({ error: "Coupon not found" }, 404);

    // Merge onto existing so a partial update still validates the resulting whole
    const merged = {
      discountType: body.discountType ?? existing.discountType,
      discountPercent: body.discountPercent !== undefined ? body.discountPercent : existing.discountPercent,
      discountAmount: body.discountAmount !== undefined ? body.discountAmount : existing.discountAmount,
    };
    const discountError = validateDiscount(merged);
    if (discountError) return c.json({ error: discountError }, 400);

    await db
      .update(coupon)
      .set({
        code: body.code ? body.code.toUpperCase() : existing.code,
        description: body.description !== undefined ? body.description : existing.description,
        discountType: merged.discountType,
        discountPercent: merged.discountType === "percentage" ? merged.discountPercent : null,
        discountAmount: merged.discountType === "fixed" ? merged.discountAmount : null,
        minimumOrderAmount: body.minimumOrderAmount !== undefined ? body.minimumOrderAmount : existing.minimumOrderAmount,
        maxUses: body.maxUses !== undefined ? body.maxUses : existing.maxUses,
        expiresAt: body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : existing.expiresAt,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
        productId: body.productId !== undefined ? body.productId : existing.productId,
        categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
        vendorId: body.vendorId !== undefined ? body.vendorId : existing.vendorId,
        updatedAt: new Date(),
      })
      .where(eq(coupon.id, id));

    const updated = await db.query.coupon.findFirst({ where: eq(coupon.id, id) });
    return c.json({ coupon: updated });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return c.json({ error: "Failed to update coupon" }, 500);
  }
});

couponAdminRoutes.delete("/:id", async (c) => {
  try {
    await db.delete(coupon).where(eq(coupon.id, c.req.param("id")));
    return c.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return c.json({ error: "Failed to delete coupon" }, 500);
  }
});

export default couponAdminRoutes;