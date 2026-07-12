import { db } from "@/db";
import { notification } from "@/db/schema/notification-schema";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, any>;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const id = crypto.randomUUID();
    await db.insert(notification).values({
      id,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body || null,
      data: params.data || null,
    });
    return id;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
