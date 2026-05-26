import { Hono } from "hono";
import { db } from "@/db";
import { review } from "@/db/schema/review-schema";
import { eq, and } from "drizzle-orm";

const reviewUserRoutes = new Hono();

reviewUserRoutes.post("/:productId", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const productId = c.req.param("productId");
    const body = await c.req.json();

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return c.json({ error: "Rating must be between 1 and 5" }, 400);
    }

    const existing = await db.query.review.findFirst({
      where: and(eq(review.productId, productId), eq(review.userId, user.id)),
    });

    if (existing) {
      return c.json({ error: "You have already reviewed this product" }, 409);
    }

    const id = crypto.randomUUID();
    await db.insert(review).values({
      id,
      productId,
      userId: user.id,
      rating: body.rating,
      title: body.title || null,
      body: body.body || null,
    });

    const created = await db.query.review.findFirst({
      where: eq(review.id, id),
      with: {
        user: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    return c.json({ review: created }, 201);
  } catch (error) {
    console.error("Error creating review:", error);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

reviewUserRoutes.put("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    const body = await c.req.json();

    const existing = await db.query.review.findFirst({
      where: eq(review.id, id),
    });

    if (!existing) return c.json({ error: "Review not found" }, 404);
    if (existing.userId !== user.id) return c.json({ error: "Forbidden" }, 403);

    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return c.json({ error: "Rating must be between 1 and 5" }, 400);
    }

    await db
      .update(review)
      .set({
        rating: body.rating ?? existing.rating,
        title: body.title !== undefined ? body.title : existing.title,
        body: body.body !== undefined ? body.body : existing.body,
        updatedAt: new Date(),
      })
      .where(eq(review.id, id));

    const updated = await db.query.review.findFirst({
      where: eq(review.id, id),
      with: {
        user: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    return c.json({ review: updated });
  } catch (error) {
    console.error("Error updating review:", error);
    return c.json({ error: "Failed to update review" }, 500);
  }
});

reviewUserRoutes.delete("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");

    const existing = await db.query.review.findFirst({
      where: eq(review.id, id),
    });

    if (!existing) return c.json({ error: "Review not found" }, 404);
    if (existing.userId !== user.id) return c.json({ error: "Forbidden" }, 403);

    await db.delete(review).where(eq(review.id, id));

    return c.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return c.json({ error: "Failed to delete review" }, 500);
  }
});

export default reviewUserRoutes;
