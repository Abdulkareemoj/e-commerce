import { Hono } from "hono";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

const onboardingRoutes = new Hono();

onboardingRoutes.patch("/role", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { role } = await c.req.json();
  // Never self-assignable. Vendor should go through become-vendor's
  // verification flow, not this endpoint — confirm that's still true,
  // then consider removing role from this route entirely.
  if (role !== "vendor") {
    return c.json({ error: "Invalid role" }, 400);
  }

  await db.update(userTable).set({ role: "vendor" }).where(eq(userTable.id, user.id));
  return c.json({ success: true, role: "vendor" });
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
