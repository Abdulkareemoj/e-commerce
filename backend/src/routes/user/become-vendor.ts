import { Hono } from "hono";
import { db } from "@/db";
import { vendor } from "@/db/schema/vendor-schema";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

const becomeVendorRoutes = new Hono();

becomeVendorRoutes.get("/", async (c) => {
  const user = (c as any).get("user") as any;

  try {
    const existing = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });

    return c.json({ vendor: existing || null });
  } catch (error) {
    console.error("Failed to check vendor status:", error);
    return c.json({ error: "Failed to check vendor status" }, 500);
  }
});

becomeVendorRoutes.post("/", async (c) => {
  const user = (c as any).get("user") as any;
  const { storeName, storeSlug, description } = await c.req.json();

  if (!storeName || !storeSlug) {
    return c.json({ error: "Store name and slug are required" }, 400);
  }

  try {
    const existing = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });

    if (existing) {
      return c.json({
        vendor: existing,
        message:
          existing.isVerified === "pending"
            ? "Application already submitted and pending review."
            : existing.isVerified === "approved"
              ? "You are already a verified vendor."
              : "Application was rejected. Contact support.",
      });
    }

    const newVendor = await db
      .insert(vendor)
      .values({
        id: nanoid(),
        userId: user.id,
        storeName,
        storeSlug,
        description: description || null,
        isVerified: "pending",
      })
      .returning();

    return c.json({ vendor: newVendor[0] });
  } catch (error: any) {
    if (error?.code === "23505") {
      return c.json({ error: "Store slug is already taken" }, 409);
    }
    console.error("Failed to create vendor:", error);
    return c.json({ error: "Failed to submit application" }, 500);
  }
});

export default becomeVendorRoutes;
