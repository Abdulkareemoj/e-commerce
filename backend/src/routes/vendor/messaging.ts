import { Hono } from "hono";
import { db } from "@/db";
import { conversation, message } from "@/db/schema/message-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { eq, desc, and } from "drizzle-orm";

const messagingVendor = new Hono();

messagingVendor.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const conversations = await db.query.conversation.findMany({
      where: eq(conversation.vendorId, v.id),
      orderBy: [desc(conversation.updatedAt)],
      with: {
        user: {
          columns: { id: true, name: true, email: true, image: true },
        },
        messages: {
          orderBy: [desc(message.createdAt)],
          limit: 1,
        },
      },
    });

    const result = conversations.map((c) => ({
      id: c.id,
      subject: c.subject,
      buyer: c.user,
      lastMessage: c.messages[0] || null,
      unread: c.messages.filter((m) => !m.read && m.senderId !== user.id).length,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return c.json({ conversations: result });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
});

messagingVendor.get("/:conversationId", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const convId = c.req.param("conversationId");
    const conv = await db.query.conversation.findFirst({
      where: and(eq(conversation.id, convId), eq(conversation.vendorId, v.id)),
      with: {
        user: {
          columns: { id: true, name: true, email: true, image: true },
        },
        messages: {
          orderBy: [desc(message.createdAt)],
          with: {
            sender: {
              columns: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!conv) return c.json({ error: "Conversation not found" }, 404);

    return c.json({ conversation: conv });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return c.json({ error: "Failed to fetch conversation" }, 500);
  }
});

messagingVendor.post("/send", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.userId, user.id),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const body = await c.req.json();
    if (!body.conversationId || !body.content) {
      return c.json({ error: "conversationId and content are required" }, 400);
    }

    const conv = await db.query.conversation.findFirst({
      where: and(eq(conversation.id, body.conversationId), eq(conversation.vendorId, v.id)),
    });
    if (!conv) return c.json({ error: "Conversation not found" }, 404);

    const msgId = crypto.randomUUID();
    await db.insert(message).values({
      id: msgId,
      conversationId: body.conversationId,
      senderId: user.id,
      content: body.content,
    });

    await db.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, body.conversationId));

    const created = await db.query.message.findFirst({
      where: eq(message.id, msgId),
      with: {
        sender: { columns: { id: true, name: true, image: true } },
      },
    });

    return c.json({ message: created }, 201);
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

export default messagingVendor;
