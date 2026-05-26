import { Hono } from "hono";
import { db } from "@/db";
import { product } from "@/db/schema/product-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { category } from "@/db/schema/category-schema";
import { eq, desc, sql, ilike, or, and } from "drizzle-orm";

const productsRoutes = new Hono();

productsRoutes.get("/list", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const search = c.req.query("search");
    const vendorId = c.req.query("vendorId");
    const categoryId = c.req.query("categoryId");
    const available = c.req.query("available");

    const conditions = [];
    if (search) {
      conditions.push(ilike(product.name, `%${search}%`));
    }
    if (vendorId) {
      conditions.push(eq(product.vendorId, vendorId));
    }
    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
    }
    if (available !== undefined) {
      conditions.push(eq(product.isAvailable, available === "true"));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(product)
      .where(where);

    const products = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        categoryName: category.name,
      })
      .from(product)
      .leftJoin(vendor, eq(product.vendorId, vendor.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(where)
      .orderBy(desc(product.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return c.json({ products, total: count, page, limit });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

productsRoutes.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const rows = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        vendorId: vendor.id,
        storeName: vendor.storeName,
        categoryId: category.id,
        categoryName: category.name,
      })
      .from(product)
      .leftJoin(vendor, eq(product.vendorId, vendor.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(eq(product.id, id))
      .limit(1);

    if (!rows.length) return c.json({ error: "Product not found" }, 404);
    return c.json({ product: rows[0] });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

productsRoutes.put("/:id/availability", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const found = await db.select().from(product).where(eq(product.id, id)).limit(1);
    if (!found.length) return c.json({ error: "Product not found" }, 404);

    await db
      .update(product)
      .set({ isAvailable: body.isAvailable !== false, updatedAt: new Date() })
      .where(eq(product.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update product:", error);
    return c.json({ error: "Failed to update product" }, 500);
  }
});

productsRoutes.delete("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    await db.delete(product).where(eq(product.id, id));
    return c.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

export default productsRoutes;
