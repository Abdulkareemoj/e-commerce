import { Hono } from "hono";
import { db } from "@/db";
import { productVariant } from "@/db/schema/product-variant-schema";
import { product } from "@/db/schema/product-schema";
import { eq, and } from "drizzle-orm";

const variantsVendor = new Hono();

variantsVendor.get("/:productId", async (c) => {
  const user = (c as any).get("user") as any;
  const productId = c.req.param("productId");

  try {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });
    if (!prod || prod.vendorId !== user.id) {
      return c.json({ error: "Product not found or access denied" }, 404);
    }

    const variants = await db.query.productVariant.findMany({
      where: eq(productVariant.productId, productId),
      orderBy: (v, { asc }) => [asc(v.sortOrder)],
    });

    return c.json({ variants });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return c.json({ error: "Failed to fetch variants" }, 500);
  }
});

variantsVendor.post("/:productId", async (c) => {
  const user = (c as any).get("user") as any;
  const productId = c.req.param("productId");

  try {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });
    if (!prod || prod.vendorId !== user.id) {
      return c.json({ error: "Product not found or access denied" }, 404);
    }

    const body = await c.req.json();
    const id = crypto.randomUUID();

    await db.insert(productVariant).values({
      id,
      productId,
      name: body.name,
      sku: body.sku,
      price: body.price || null,
      stock: body.stock ?? 0,
      attributes: body.attributes || null,
      image: body.image || null,
      sortOrder: body.sortOrder ?? 0,
    });

    return c.json({ message: "Variant created", variant: { id } }, 201);
  } catch (error) {
    console.error("Error creating variant:", error);
    return c.json({ error: "Failed to create variant" }, 500);
  }
});

variantsVendor.put("/:productId/:variantId", async (c) => {
  const user = (c as any).get("user") as any;
  const { productId, variantId } = c.req.param();

  try {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });
    if (!prod || prod.vendorId !== user.id) {
      return c.json({ error: "Product not found or access denied" }, 404);
    }

    const body = await c.req.json();
    await db
      .update(productVariant)
      .set({
        name: body.name,
        sku: body.sku,
        price: body.price,
        stock: body.stock,
        attributes: body.attributes,
        image: body.image,
        sortOrder: body.sortOrder,
        isAvailable: body.isAvailable,
      })
      .where(eq(productVariant.id, variantId));

    return c.json({ message: "Variant updated" });
  } catch (error) {
    console.error("Error updating variant:", error);
    return c.json({ error: "Failed to update variant" }, 500);
  }
});

variantsVendor.delete("/:productId/:variantId", async (c) => {
  const user = (c as any).get("user") as any;
  const { productId, variantId } = c.req.param();

  try {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });
    if (!prod || prod.vendorId !== user.id) {
      return c.json({ error: "Product not found or access denied" }, 404);
    }

    await db.delete(productVariant).where(eq(productVariant.id, variantId));
    return c.json({ message: "Variant deleted" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return c.json({ error: "Failed to delete variant" }, 500);
  }
});

export default variantsVendor;
