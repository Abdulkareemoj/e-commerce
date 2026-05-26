import { Hono } from "hono";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

const onboardingRoutes = new Hono();

onboardingRoutes.patch("/role", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.json();
    const { role } = body;

    if (role && !["user", "vendor", "admin"].includes(role)) {
      return c.json({ error: "Invalid role" }, 400);
    }

    if (role) {
      await db.update(userTable).set({ role }).where(eq(userTable.id, user.id));
    }

    return c.json({ success: true, role });
  } catch (error) {
    console.error("Failed to update role:", error);
    return c.json({ error: "Failed to update role" }, 500);
  }
});

onboardingRoutes.patch("/onboarding", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    return c.json({ success: true, onboardingComplete: true });
  } catch (error) {
    console.error("Failed to mark onboarding:", error);
    return c.json({ error: "Failed to mark onboarding" }, 500);
  }
});

export default onboardingRoutes;
