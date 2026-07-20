import { Hono } from "hono";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { eq, desc, sql, ilike, or } from "drizzle-orm";

const usersRoutes = new Hono();

usersRoutes.get("/list", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const search = c.req.query("search");
    const role = c.req.query("role");

    const conditions = [];
    if (search) {
      conditions.push(
    or(
  ilike(user.name, `%${search}%`),
  ilike(user.email, `%${search}%`),
  ilike(user.username, `%${search}%`)
)
      );
    }
    if (role) {
      conditions.push(eq(user.role, role));
    }

    const where = conditions.length > 0 ? conditions.reduce((a, b) => sql`${a} and ${b}`) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(where);

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(where)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return c.json({ users, total: count, page, limit });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

usersRoutes.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const found = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!found.length) return c.json({ error: "User not found" }, 404);
    return c.json({ user: found[0] });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

usersRoutes.put("/:id/ban", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const found = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!found.length) return c.json({ error: "User not found" }, 404);

    await db
      .update(user)
      .set({
        banned: body.banned !== false,
        banReason: body.reason || null,
        banExpires: body.expiresAt ? new Date(body.expiresAt) : null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update user ban:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

usersRoutes.put("/:id/role", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    if (!["user", "vendor", "admin"].includes(body.role)) {
      return c.json({ error: "Invalid role" }, 400);
    }

    const found = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!found.length) return c.json({ error: "User not found" }, 404);

    // Prevent locking every admin out of the panel with no recovery path
    if (found[0].role === "admin" && body.role !== "admin") {
      const [{ count: adminCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(eq(user.role, "admin"));

      if (Number(adminCount) <= 1) {
        return c.json(
          { error: "Cannot remove the last admin. Promote another user to admin first." },
          400
        );
      }
    }

    await db
      .update(user)
      .set({ role: body.role, updatedAt: new Date() })
      .where(eq(user.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

export default usersRoutes;
