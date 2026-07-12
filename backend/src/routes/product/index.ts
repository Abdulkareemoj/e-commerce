import { Hono } from "hono";
import { db } from "@/db";
import { product } from "@/db/schema/product-schema";
import { category } from "@/db/schema/category-schema";
import { review } from "@/db/schema/review-schema";
import { eq, desc, asc, and, sql, ne } from "drizzle-orm";

const productPublicRoutes = new Hono();

productPublicRoutes.get("/", async (c) => {
  try {
    const categoryId = c.req.query("categoryId");
    const search = c.req.query("search");
    const minPrice = c.req.query("minPrice");
    const maxPrice = c.req.query("maxPrice");
    const sortBy = c.req.query("sortBy") || "createdAt";
    const sortOrder = c.req.query("sortOrder") || "desc";

    const products = await db.query.product.findMany({
      where: (prod, { eq, and, ilike, gte, lte }) => {
        const conditions = [eq(prod.isAvailable, true)];
        if (categoryId) {
          conditions.push(eq(prod.categoryId, categoryId));
        }
        if (search) {
          conditions.push(ilike(prod.name, `%${search}%`));
        }
        if (minPrice) {
          conditions.push(gte(prod.price, minPrice));
        }
        if (maxPrice) {
          conditions.push(lte(prod.price, maxPrice));
        }
        return and(...conditions);
      },
      orderBy: (prod, { desc, asc }) => {
        const dir = sortOrder === "asc" ? asc : desc;
        switch (sortBy) {
          case "price": return [dir(prod.price)];
          case "name": return [dir(prod.name)];
          default: return [dir(prod.createdAt)];
        }
      },
      with: {
        vendor: {
          columns: {
            id: true,
            storeName: true,
          },
        },
        variants: {
          orderBy: (v, { asc }) => [asc(v.sortOrder)],
        },
      },
    });

    return c.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

productPublicRoutes.get("/categories", async (c) => {
  try {
    const categories = await db.select().from(category).orderBy(category.name);
    return c.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

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
          },
        },
        variants: {
          orderBy: (v, { asc }) => [asc(v.sortOrder)],
        },
      },
    });

    if (!prod) {
      return c.json({ error: "Product not found" }, 404);
    }

    const avgResult = await db
      .select({ avg: sql<number>`ROUND(AVG(${review.rating})::numeric, 1)` })
      .from(review)
      .where(eq(review.productId, id));

    const avgRating = avgResult[0]?.avg ?? null;

    return c.json({ product: { ...prod, avgRating, rating: avgRating } });
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

productPublicRoutes.get("/:id/reviews", async (c) => {
  const id = c.req.param("id");
  try {
    const reviews = await db.query.review.findMany({
      where: eq(review.productId, id),
      orderBy: [desc(review.createdAt)],
      with: {
        user: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    const avgResult = await db
      .select({ avg: sql<number>`ROUND(AVG(${review.rating})::numeric, 1)` })
      .from(review)
      .where(eq(review.productId, id));

    const avgRating = avgResult[0]?.avg ?? null;
    const totalReviews = reviews.length;

    return c.json({ reviews, avgRating, totalReviews });
  } catch (error) {
    console.error(`Error fetching reviews for product ${id}:`, error);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});

productPublicRoutes.get("/:id/related", async (c) => {
  const id = c.req.param("id");
  try {
    const current = await db.query.product.findFirst({
      where: (p, { eq }) => eq(p.id, id),
    });

    if (!current) {
      return c.json({ products: [] });
    }

    const related = await db.query.product.findMany({
      where: (p, { eq, and, ne, or, ilike }) => {
        const conditions = [ne(p.id, id), eq(p.isAvailable, true)];

        if (current.categoryId) {
          return or(
            and(eq(p.categoryId, current.categoryId), ...conditions),
            and(
              ilike(p.name, `%${current.name.split(" ")[0]}%`),
              ...conditions,
            ),
          );
        }

        return and(
          ilike(p.name, `%${current.name.split(" ")[0]}%`),
          ...conditions,
        );
      },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: 8,
      with: {
        vendor: {
          columns: { id: true, storeName: true },
        },
        variants: {
          orderBy: (v, { asc }) => [asc(v.sortOrder)],
        },
      },
    });

    return c.json({ products: related });
  } catch (error) {
    console.error(`Error fetching related products for ${id}:`, error);
    return c.json({ error: "Failed to fetch related products" }, 500);
  }
});

export default productPublicRoutes;
