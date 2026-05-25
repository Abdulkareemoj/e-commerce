import { Hono } from "hono";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth-schema";
import { profile } from "@/db/schema/profile-schema";
import { eq } from "drizzle-orm";

const profileVendor = new Hono();

profileVendor.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const usr = await db.query.user.findFirst({
      where: eq(userTable.id, user.id),
      columns: { id: true, name: true, email: true, image: true },
    });

    const prof = await db.query.profile.findFirst({
      where: eq(profile.id, user.id),
    });

    return c.json({
      profile: {
        ...usr,
        bio: prof?.bio || null,
        location: prof?.location || null,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

profileVendor.put("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();

    if (body.name !== undefined) {
      await db.update(userTable).set({ name: body.name }).where(eq(userTable.id, user.id));
    }

    if (body.email !== undefined) {
      await db.update(userTable).set({ email: body.email }).where(eq(userTable.id, user.id));
    }

    const existing = await db.query.profile.findFirst({
      where: eq(profile.id, user.id),
    });

    const profileData: Record<string, any> = {};
    if (body.bio !== undefined) profileData.bio = body.bio;
    if (body.location !== undefined) profileData.location = body.location;
    profileData.updatedAt = new Date();

    if (existing) {
      await db.update(profile).set(profileData).where(eq(profile.id, user.id));
    } else {
      await db.insert(profile).values({
        id: user.id,
        bio: body.bio || null,
        location: body.location || null,
      });
    }

    const usr = await db.query.user.findFirst({
      where: eq(userTable.id, user.id),
      columns: { id: true, name: true, email: true, image: true },
    });
    const prof = await db.query.profile.findFirst({
      where: eq(profile.id, user.id),
    });

    return c.json({
      profile: {
        ...usr,
        bio: prof?.bio || null,
        location: prof?.location || null,
      },
    });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

export default profileVendor;
