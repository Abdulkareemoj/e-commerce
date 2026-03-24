import { Hono } from "hono";
import { db } from "@/db";
import { profile } from "@/db/schema/profile-schema";
import { eq } from "drizzle-orm";

const profileUser = new Hono();

profileUser.get("/", async (c) => {
  const user = (c as any).get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.id, user.id)
    });
    return c.json({ user, profile: userProfile });
  } catch (error) {
    console.error("Profile GET error", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

profileUser.put("/", async (c) => {
  const user = (c as any).get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  
  const body = await c.req.json();

  try {
    await db.update(profile)
      .set({
        bio: body.bio,
        location: body.location
      })
      .where(eq(profile.id, user.id));

    return c.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile PUT error", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

export default profileUser;
