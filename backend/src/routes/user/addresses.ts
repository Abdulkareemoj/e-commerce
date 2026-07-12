import { Hono } from "hono";
import { db } from "@/db";
import { address } from "@/db/schema/address-schema";
import { eq, and } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

const addressesUser = new Hono();

addressesUser.get("/", async (c) => {
  const user = (c as any).get("user") as any;

  try {
    const rows = await db.query.address.findMany({
      where: eq(address.userId, user.id),
      orderBy: (a, { desc }) => [desc(a.isDefault), desc(a.createdAt)],
    });

    const addresses = rows.map((r) => ({
      id: r.id,
      name: "",
      phone: "",
      street: r.line1,
      city: r.city,
      state: r.state || "",
      zip: r.postalCode,
      country: r.country,
      isDefault: r.isDefault,
      type: r.type,
    }));

    return c.json({ addresses });
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return c.json({ error: "Failed to fetch addresses" }, 500);
  }
});

addressesUser.get("/:id", async (c) => {
  const user = (c as any).get("user") as any;
  const { id } = c.req.param();

  try {
    const r = await db.query.address.findFirst({
      where: and(eq(address.id, id), eq(address.userId, user.id)),
    });

    if (!r) {
      return c.json({ error: "Address not found" }, 404);
    }

    const addr = {
      id: r.id,
      name: "",
      phone: "",
      street: r.line1,
      city: r.city,
      state: r.state || "",
      zip: r.postalCode,
      country: r.country,
      isDefault: r.isDefault,
      type: r.type,
    };

    return c.json({ address: addr });
  } catch (error) {
    console.error("Failed to fetch address:", error);
    return c.json({ error: "Failed to fetch address" }, 500);
  }
});

addressesUser.post("/", async (c) => {
  const user = (c as any).get("user") as any;
  const body = await c.req.json();

  const line1 = body.line1 || body.street;
  const postalCode = body.postalCode || body.zip;
  const country = body.country || "US";
  const type = body.type || "shipping";

  if (!line1 || !body.city || !postalCode) {
    return c.json(
      {
        error: "street (or line1), city, and zip (or postalCode) are required",
      },
      400,
    );
  }

  try {
    if (body.isDefault) {
      await db
        .update(address)
        .set({ isDefault: false })
        .where(and(eq(address.userId, user.id), eq(address.isDefault, true)));
    }

    const newAddress = await db
      .insert(address)
      .values({
        id: nanoid(),
        userId: user.id,
        type,
        line1,
        line2: body.line2 || null,
        city: body.city,
        state: body.state || null,
        postalCode,
        country,
        isDefault: body.isDefault || false,
      })
      .returning();

    const r = newAddress[0];
    const result = {
      id: r.id,
      name: body.name || "",
      phone: body.phone || "",
      street: r.line1,
      city: r.city,
      state: r.state || "",
      zip: r.postalCode,
      country: r.country,
      isDefault: r.isDefault,
      type: r.type,
    };

    return c.json({ address: result }, 201);
  } catch (error) {
    console.error("Failed to create address:", error);
    return c.json({ error: "Failed to create address" }, 500);
  }
});

addressesUser.put("/:id", async (c) => {
  const user = (c as any).get("user") as any;
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const existing = await db.query.address.findFirst({
      where: and(eq(address.id, id), eq(address.userId, user.id)),
    });

    if (!existing) {
      return c.json({ error: "Address not found" }, 404);
    }

    if (body.isDefault) {
      await db
        .update(address)
        .set({ isDefault: false })
        .where(and(eq(address.userId, user.id), eq(address.isDefault, true)));
    }

    const line1 = body.line1 || body.street || existing.line1;
    const postalCode = body.postalCode || body.zip || existing.postalCode;

    const updated = await db
      .update(address)
      .set({
        type: body.type ?? existing.type,
        line1,
        line2: body.line2 !== undefined ? body.line2 : existing.line2,
        city: body.city ?? existing.city,
        state: body.state !== undefined ? body.state : existing.state,
        postalCode,
        country: body.country ?? existing.country,
        isDefault: body.isDefault ?? existing.isDefault,
        updatedAt: new Date(),
      })
      .where(eq(address.id, id))
      .returning();

    const r = updated[0];
    const result = {
      id: r.id,
      name: body.name || "",
      phone: body.phone || "",
      street: r.line1,
      city: r.city,
      state: r.state || "",
      zip: r.postalCode,
      country: r.country,
      isDefault: r.isDefault,
      type: r.type,
    };

    return c.json({ address: result });
  } catch (error) {
    console.error("Failed to update address:", error);
    return c.json({ error: "Failed to update address" }, 500);
  }
});

addressesUser.delete("/:id", async (c) => {
  const user = (c as any).get("user") as any;
  const { id } = c.req.param();

  try {
    const existing = await db.query.address.findFirst({
      where: and(eq(address.id, id), eq(address.userId, user.id)),
    });

    if (!existing) {
      return c.json({ error: "Address not found" }, 404);
    }

    await db.delete(address).where(eq(address.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return c.json({ error: "Failed to delete address" }, 500);
  }
});

export default addressesUser;
