import { Hono } from "hono";
import { db } from "@/db";
import { vendor } from "@/db/schema/vendor-schema";
import { user } from "@/db/schema/auth-schema";
import { eq, desc } from "drizzle-orm";

const vendorsRoutes = new Hono();

vendorsRoutes.get("/list", async (c) => {
  const status = c.req.query("status");

  try {
    let conditions;
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      conditions = eq(vendor.isVerified, status as any);
    }

    const vendors = await db
      .select({
        id: vendor.id,
        userId: vendor.userId,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        description: vendor.description,
        isVerified: vendor.isVerified,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(vendor)
      .leftJoin(user, eq(vendor.userId, user.id))
      .where(conditions || undefined)
      .orderBy(desc(vendor.createdAt));

    return c.json({ vendors });
  } catch (error) {
    console.error("Failed to fetch vendors:", error);
    return c.json({ error: "Failed to fetch vendors" }, 500);
  }
});

vendorsRoutes.get("/:id", async (c) => {
  const { id } = c.req.param();

  try {
    const rows = await db
      .select({
        id: vendor.id,
        userId: vendor.userId,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        description: vendor.description,
        isVerified: vendor.isVerified,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(vendor)
      .leftJoin(user, eq(vendor.userId, user.id))
      .where(eq(vendor.id, id))
      .limit(1);

    if (!rows.length) {
      return c.json({ error: "Vendor not found" }, 404);
    }

    return c.json({ vendor: rows[0] });
  } catch (error) {
    console.error("Failed to fetch vendor:", error);
    return c.json({ error: "Failed to fetch vendor" }, 500);
  }
});

vendorsRoutes.put("/:id/approve", async (c) => {
  const { id } = c.req.param();

  try {
    const vendors = await db
      .select()
      .from(vendor)
      .where(eq(vendor.id, id))
      .limit(1);

    if (!vendors.length) {
      return c.json({ error: "Vendor not found" }, 404);
    }

    const v = vendors[0];

    if (v.isVerified !== "pending") {
      return c.json({ error: `Vendor is already ${v.isVerified}` }, 400);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(vendor)
        .set({ isVerified: "approved", updatedAt: new Date() })
        .where(eq(vendor.id, id));

      await tx
        .update(user)
        .set({ role: "vendor" })
        .where(eq(user.id, v.userId));
    });

    return c.json({ success: true, message: "Vendor approved" });
  } catch (error) {
    console.error("Failed to approve vendor:", error);
    return c.json({ error: "Failed to approve vendor" }, 500);
  }
});

vendorsRoutes.put("/:id/reject", async (c) => {
  const { id } = c.req.param();

  try {
    const vendors = await db
      .select()
      .from(vendor)
      .where(eq(vendor.id, id))
      .limit(1);

    if (!vendors.length) {
      return c.json({ error: "Vendor not found" }, 404);
    }

    const v = vendors[0];

    if (v.isVerified !== "pending") {
      return c.json({ error: `Vendor is already ${v.isVerified}` }, 400);
    }

    await db
      .update(vendor)
      .set({ isVerified: "rejected", updatedAt: new Date() })
      .where(eq(vendor.id, id));

    return c.json({ success: true, message: "Vendor rejected" });
  } catch (error) {
    console.error("Failed to reject vendor:", error);
    return c.json({ error: "Failed to reject vendor" }, 500);
  }
});

export default vendorsRoutes;
