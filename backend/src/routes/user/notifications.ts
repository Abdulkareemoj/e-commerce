import { Hono } from "hono";
import { db } from "@/db";
import { notification } from "@/db/schema/notification-schema";
import { eq, desc, and } from "drizzle-orm";

const notificationsUser = new Hono();

notificationsUser.get("/", async (c) => {
  const user = c.get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 50);
    const offset = (page - 1) * limit;

    const notifications = await db.query.notification.findMany({
      where: eq(notification.userId, user.id),
      orderBy: [desc(notification.createdAt)],
      limit,
      offset,
    });

    const total = await db.$count(notification, eq(notification.userId, user.id));
    const unread = await db.$count(
      notification,
      and(eq(notification.userId, user.id), eq(notification.read, false))
    );

    return c.json({ notifications, total, unread, page, limit });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

notificationsUser.put("/read-all", async (c) => {
  const user = c.get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    await db
      .update(notification)
      .set({ read: true })
      .where(and(eq(notification.userId, user.id), eq(notification.read, false)));

    return c.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return c.json({ error: "Failed to mark notifications as read" }, 500);
  }
});

notificationsUser.put("/:id/read", async (c) => {
  const user = c.get("user") as any;
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    await db
      .update(notification)
      .set({ read: true })
      .where(and(eq(notification.id, c.req.param("id")), eq(notification.userId, user.id)));

    return c.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return c.json({ error: "Failed to mark notification as read" }, 500);
  }
});

export default notificationsUser;
