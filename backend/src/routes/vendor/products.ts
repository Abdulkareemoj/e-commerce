import { Hono } from "hono";
import { db } from "@/db";
import { product } from "@/db/schema/product-schema";
import { productVariant } from "@/db/schema/product-variant-schema";
import { eq, desc } from "drizzle-orm";

const productsVendor = new Hono();

productsVendor.get("/", async (c) => {
  const user = (c as any).get("user") as any;

  try {
    const products = await db.query.product.findMany({
      where: eq(product.vendorId, user.id),
      orderBy: desc(product.createdAt),
      with: {
        variants: {
          orderBy: (v, { asc }) => [asc(v.sortOrder)],
        },
      },
    });

    return c.json({ products });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

productsVendor.get("/:id", async (c) => {
  const user = (c as any).get("user") as any;
  const id = c.req.param("id");

  try {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, id),
      with: {
        variants: {
          orderBy: (v, { asc }) => [asc(v.sortOrder)],
        },
      },
    });

    if (!prod || prod.vendorId !== user.id) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product: prod });
  } catch (error) {
    console.error("Error fetching product:", error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

productsVendor.post("/", async (c) => {
  const user = (c as any).get("user") as any;
  const body = await c.req.json();

  if (!body.name || !body.price) {
    return c.json({ error: "Name and price are required" }, 400);
  }

  try {
    const id = crypto.randomUUID();
    const slug = body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + id.slice(0, 6);

    await db.insert(product).values({
      id,
      vendorId: user.id,
      name: body.name,
      slug,
      description: body.description || "",
      price: body.price,
      stock: body.stock ?? 0,
      categoryId: body.categoryId || null,
      images: body.images || [],
    });

    if (body.variants && body.variants.length > 0) {
      const variantValues = body.variants.map((v: any) => ({
        id: crypto.randomUUID(),
        productId: id,
        name: v.name,
        sku: v.sku,
        price: v.price || null,
        stock: v.stock ?? 0,
        attributes: v.attributes || null,
        image: v.image || null,
        sortOrder: v.sortOrder ?? 0,
      }));

      await db.insert(productVariant).values(variantValues);
    }

    return c.json({ message: "Product created", productId: id }, 201);
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "Failed to create product" }, 500);
  }
});

productsVendor.put("/:id", async (c) => {
  const user = (c as any).get("user") as any;
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, id),
    });

    if (!prod || prod.vendorId !== user.id) {
      return c.json({ error: "Product not found" }, 404);
    }

    await db
      .update(product)
      .set({
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        categoryId: body.categoryId,
        images: body.images,
        isAvailable: body.isAvailable,
      })
      .where(eq(product.id, id));

    return c.json({ message: "Product updated" });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "Failed to update product" }, 500);
  }
});

productsVendor.delete("/:id", async (c) => {
  const user = (c as any).get("user") as any;
  const id = c.req.param("id");

  try {
    const prod = await db.query.product.findFirst({
      where: eq(product.id, id),
    });

    if (!prod || prod.vendorId !== user.id) {
      return c.json({ error: "Product not found" }, 404);
    }

    await db.delete(product).where(eq(product.id, id));
    return c.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

export default productsVendor;
