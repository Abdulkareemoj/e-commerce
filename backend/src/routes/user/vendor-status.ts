import { Hono } from "hono";
import { db } from "@/db";
import { vendor } from "@/db/schema/vendor-schema";
import { eq } from "drizzle-orm";

const vendorStatusRoutes = new Hono();

vendorStatusRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const existing = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });

    return c.json({
      status: existing?.isVerified ?? null,
      vendor: existing || null,
    });
  } catch (error) {
    console.error("Failed to check vendor status:", error);
    return c.json({ error: "Failed to check vendor status" }, 500);
  }
});

export default vendorStatusRoutes;
