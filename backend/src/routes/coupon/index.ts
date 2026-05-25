import { Hono } from "hono";
import { db } from "@/db";
import { coupon } from "@/db/schema/coupon-schema";
import { eq, and, lt, gt, sql } from "drizzle-orm";

const couponPublicRoutes = new Hono();

couponPublicRoutes.get("/validate", async (c) => {
  try {
    const code = c.req.query("code");
    const subtotalCents = parseInt(c.req.query("subtotalCents") || "0", 10);

    if (!code) return c.json({ valid: false, error: "Code is required" }, 400);

    const found = await db.query.coupon.findFirst({
      where: eq(sql`UPPER(${coupon.code})`, code.toUpperCase()),
    });

    if (!found) return c.json({ valid: false, error: "Coupon not found" });

    if (!found.isActive) return c.json({ valid: false, error: "Coupon is inactive" });

    const now = new Date();
    if (found.startsAt && new Date(found.startsAt) > now) {
      return c.json({ valid: false, error: "Coupon not yet valid" });
    }
    if (found.expiresAt && new Date(found.expiresAt) < now) {
      return c.json({ valid: false, error: "Coupon has expired" });
    }

    if (found.maxUses > 0 && found.currentUses >= found.maxUses) {
      return c.json({ valid: false, error: "Coupon usage limit reached" });
    }

    if (found.minimumOrderCents > 0 && subtotalCents < found.minimumOrderCents) {
      return c.json({
        valid: false,
        error: `Minimum order of $${(found.minimumOrderCents / 100).toFixed(2)} required`,
      });
    }

    let discountCents = 0;
    if (found.discountType === "percentage") {
      discountCents = Math.round(subtotalCents * (parseFloat(found.discountValue) / 100));
    } else {
      discountCents = Math.round(parseFloat(found.discountValue) * 100);
    }

    if (discountCents > subtotalCents) discountCents = subtotalCents;

    return c.json({
      valid: true,
      coupon: {
        id: found.id,
        code: found.code,
        description: found.description,
        discountType: found.discountType,
        discountValue: found.discountValue,
        discountCents,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return c.json({ valid: false, error: "Failed to validate coupon" }, 500);
  }
});

export default couponPublicRoutes;
