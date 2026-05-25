import { Hono } from "hono";
import { db } from "@/db";
import { product } from "@/db/schema/product-schema";
import { productVariant } from "@/db/schema/product-variant-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { eq, and, lt, desc } from "drizzle-orm";

const inventoryVendor = new Hono();

inventoryVendor.get("/low-stock", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const threshold = parseInt(c.req.query("threshold") || "10", 10);

    const lowStockProducts = await db.query.product.findMany({
      where: and(eq(product.vendorId, v.id), eq(product.isAvailable, true), lt(product.stock, threshold)),
      orderBy: [desc(product.createdAt)],
      with: {
        variants: {
          orderBy: (v, { asc }) => [asc(v.sortOrder)],
        },
      },
    });

    const lowStockVariants = lowStockProducts.flatMap((p) =>
      (p.variants || []).filter((v) => v.stock < threshold).map((v) => ({
        productId: p.id,
        productName: p.name,
        productImage: p.images?.[0] || null,
        variantId: v.id,
        variantName: v.name,
        sku: v.sku,
        stock: v.stock,
        threshold,
      }))
    );

    const lowStockMain = lowStockProducts
      .filter((p) => !p.variants || p.variants.length === 0 || p.variants.every((v) => v.stock >= threshold))
      .map((p) => ({
        productId: p.id,
        productName: p.name,
        productImage: p.images?.[0] || null,
        stock: p.stock,
        threshold,
      }));

    return c.json({
      lowStockProducts: lowStockMain,
      lowStockVariants,
      total: lowStockMain.length + lowStockVariants.length,
    });
  } catch (error) {
    console.error("Error fetching low stock:", error);
    return c.json({ error: "Failed to fetch low stock" }, 500);
  }
});

inventoryVendor.put("/products/:productId/stock", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const productId = c.req.param("productId");
    const body = await c.req.json();

    if (body.stock === undefined || body.stock < 0) {
      return c.json({ error: "Valid stock value required" }, 400);
    }

    const existing = await db.query.product.findFirst({
      where: and(eq(product.id, productId), eq(product.vendorId, v.id)),
    });
    if (!existing) return c.json({ error: "Product not found" }, 404);

    await db.update(product).set({ stock: body.stock }).where(eq(product.id, productId));

    return c.json({ message: "Stock updated", stock: body.stock });
  } catch (error) {
    console.error("Error updating stock:", error);
    return c.json({ error: "Failed to update stock" }, 500);
  }
});

inventoryVendor.put("/variants/:variantId/stock", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const variantId = c.req.param("variantId");
    const body = await c.req.json();

    if (body.stock === undefined || body.stock < 0) {
      return c.json({ error: "Valid stock value required" }, 400);
    }

    const existing = await db.query.productVariant.findFirst({
      where: and(eq(productVariant.id, variantId)),
      with: { product: { columns: { vendorId: true } } },
    });
    if (!existing || existing.product.vendorId !== v.id) {
      return c.json({ error: "Variant not found" }, 404);
    }

    await db.update(productVariant).set({ stock: body.stock }).where(eq(productVariant.id, variantId));

    return c.json({ message: "Variant stock updated", stock: body.stock });
  } catch (error) {
    console.error("Error updating variant stock:", error);
    return c.json({ error: "Failed to update stock" }, 500);
  }
});

export default inventoryVendor;
