import { Hono } from "hono";
import { db } from "@/db";
import { wishlistItem } from "@/db/schema/wishlist-schema";
import { product } from "@/db/schema/product-schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { productVariant } from "@/db/schema/product-variant-schema";

const wishlistUserRoutes = new Hono();

wishlistUserRoutes.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const items = await db.query.wishlistItem.findMany({
      where: eq(wishlistItem.userId, user.id),
      orderBy: [desc(wishlistItem.createdAt)],
      with: {
        product: {
          with: {
            variants: {
              orderBy: (v, { asc }) => [asc(v.sortOrder)],
            },
          },
        },
      },
    });

    return c.json({ items });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return c.json({ error: "Failed to fetch wishlist" }, 500);
  }
});

wishlistUserRoutes.get("/check", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const productId = c.req.query("productId");
    if (!productId) return c.json({ error: "productId required" }, 400);

    const existing = await db.query.wishlistItem.findFirst({
      where: and(eq(wishlistItem.userId, user.id), eq(wishlistItem.productId, productId)),
    });

    return c.json({ isWishlisted: !!existing });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return c.json({ error: "Failed to check wishlist" }, 500);
  }
});

wishlistUserRoutes.post("/:productId", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const productId = c.req.param("productId");

    const existing = await db.query.wishlistItem.findFirst({
      where: and(eq(wishlistItem.userId, user.id), eq(wishlistItem.productId, productId)),
    });

    if (existing) {
      return c.json({ message: "Already in wishlist" });
    }

    const id = crypto.randomUUID();
    await db.insert(wishlistItem).values({ id, userId: user.id, productId });

    return c.json({ message: "Added to wishlist", id }, 201);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return c.json({ error: "Failed to add to wishlist" }, 500);
  }
});

wishlistUserRoutes.delete("/:productId", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const productId = c.req.param("productId");

    await db
      .delete(wishlistItem)
      .where(and(eq(wishlistItem.userId, user.id), eq(wishlistItem.productId, productId)));

    return c.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return c.json({ error: "Failed to remove from wishlist" }, 500);
  }
});

export default wishlistUserRoutes;
