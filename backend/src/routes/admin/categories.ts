import { Hono } from "hono";
import { db } from "@/db";
import { category } from "@/db/schema/category-schema";
import { eq, desc } from "drizzle-orm";

const categoriesRoutes = new Hono();

categoriesRoutes.get("/", async (c) => {
  try {
    const categories = await db.query.category.findMany({
      orderBy: [desc(category.createdAt)],
    });
    return c.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

categoriesRoutes.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const found = await db.query.category.findFirst({
      where: eq(category.id, id),
    });
    if (!found) return c.json({ error: "Category not found" }, 404);
    return c.json({ category: found });
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return c.json({ error: "Failed to fetch category" }, 500);
  }
});

categoriesRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.name || !body.slug) {
      return c.json({ error: "name and slug are required" }, 400);
    }

    const id = crypto.randomUUID();
    await db.insert(category).values({
      id,
      name: body.name,
      slug: body.slug,
      description: body.description || null,
    });

    const created = await db.query.category.findFirst({
      where: eq(category.id, id),
    });
    return c.json({ category: created }, 201);
  } catch (error) {
    console.error("Failed to create category:", error);
    return c.json({ error: "Failed to create category" }, 500);
  }
});

categoriesRoutes.put("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const existing = await db.query.category.findFirst({
      where: eq(category.id, id),
    });
    if (!existing) return c.json({ error: "Category not found" }, 404);

    await db
      .update(category)
      .set({
        name: body.name ?? existing.name,
        slug: body.slug ?? existing.slug,
        description: body.description !== undefined ? body.description : existing.description,
        updatedAt: new Date(),
      })
      .where(eq(category.id, id));

    const updated = await db.query.category.findFirst({
      where: eq(category.id, id),
    });
    return c.json({ category: updated });
  } catch (error) {
    console.error("Failed to update category:", error);
    return c.json({ error: "Failed to update category" }, 500);
  }
});

categoriesRoutes.delete("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    await db.delete(category).where(eq(category.id, id));
    return c.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

export default categoriesRoutes;
