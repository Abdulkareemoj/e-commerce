import { Hono } from "hono";
import { db } from "@/db";
import { product } from "@/db/schema/product-schema";
import { category } from "@/db/schema/category-schema";
import { eq, desc, and } from "drizzle-orm";

const productPublicRoutes = new Hono();

// GET /api/products
// Fetch all public products, with optional ?categoryId= & ?search= filtering
productPublicRoutes.get("/", async (c) => {
  try {
    const categoryId = c.req.query("categoryId");
    const search = c.req.query("search");
    
    const products = await db.query.product.findMany({
      where: (prod, { eq, and, ilike }) => {
        const conditions = [eq(prod.isAvailable, true)];
        if (categoryId) {
          conditions.push(eq(prod.categoryId, categoryId));
        }
        if (search) {
          conditions.push(ilike(prod.name, `%${search}%`));
        }
        return and(...conditions);
      },
      orderBy: (prod, { desc }) => [desc(prod.createdAt)],
      with: {
        vendor: {
          columns: {
            id: true,
            storeName: true,
          }
        }
      }
    });
    
    return c.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// GET /api/products/categories
// Fetch all categories
productPublicRoutes.get("/categories", async (c) => {
  try {
    const categories = await db.select().from(category).orderBy(category.name);
    return c.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// GET /api/products/:id
// Fetch single product by ID
productPublicRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const prod = await db.query.product.findFirst({
      where: (p, { eq }) => eq(p.id, id),
      with: {
        vendor: {
          columns: {
            id: true,
            storeName: true,
          }
        }
      }
    });

    if (!prod) {
      return c.json({ error: "Product not found" }, 404);
    }
    return c.json({ product: prod });
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

export default productPublicRoutes;