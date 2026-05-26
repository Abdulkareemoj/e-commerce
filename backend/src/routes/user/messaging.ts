import { Hono } from "hono";
import { db } from "@/db";
import { conversation, message } from "@/db/schema/message-schema";
import { vendor } from "@/db/schema/vendor-schema";
import { eq, desc, and } from "drizzle-orm";

const messagingUser = new Hono();

messagingUser.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const conversations = await db.query.conversation.findMany({
      where: eq(conversation.userId, user.id),
      orderBy: [desc(conversation.updatedAt)],
      with: {
        vendor: {
          columns: { id: true, storeName: true, storeSlug: true },
          with: {
            user: {
              columns: { id: true, name: true, image: true },
            },
          },
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
      vendor: {
        id: c.vendor.id,
        storeName: c.vendor.storeName,
        storeSlug: c.vendor.storeSlug,
        name: c.vendor.user?.name || "Unknown",
        image: c.vendor.user?.image || null,
      },
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

messagingUser.get("/:conversationId", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const convId = c.req.param("conversationId");
    const conv = await db.query.conversation.findFirst({
      where: and(eq(conversation.id, convId), eq(conversation.userId, user.id)),
      with: {
        vendor: {
          columns: { id: true, storeName: true, storeSlug: true },
          with: {
            user: {
              columns: { id: true, name: true, image: true },
            },
          },
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

    await db.update(message).set({ read: true }).where(
      and(eq(message.conversationId, convId), eq(message.read, false))
    );

    return c.json({ conversation: conv });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return c.json({ error: "Failed to fetch conversation" }, 500);
  }
});

messagingUser.post("/start", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    if (!body.vendorId || !body.content) {
      return c.json({ error: "vendorId and content are required" }, 400);
    }

    const v = await db.query.vendor.findFirst({
      where: eq(vendor.id, body.vendorId),
    });
    if (!v) return c.json({ error: "Vendor not found" }, 404);

    const existingConv = await db.query.conversation.findFirst({
      where: and(eq(conversation.vendorId, body.vendorId), eq(conversation.userId, user.id)),
    });

    if (existingConv) {
      const msgId = crypto.randomUUID();
      await db.insert(message).values({
        id: msgId,
        conversationId: existingConv.id,
        senderId: user.id,
        content: body.content,
      });
      await db.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, existingConv.id));

      const created = await db.query.message.findFirst({
        where: eq(message.id, msgId),
        with: { sender: { columns: { id: true, name: true, image: true } } },
      });

      return c.json({ conversation: existingConv, message: created }, 201);
    }

    const convId = crypto.randomUUID();
    await db.insert(conversation).values({
      id: convId,
      vendorId: body.vendorId,
      userId: user.id,
      subject: body.subject || null,
    });

    const msgId = crypto.randomUUID();
    await db.insert(message).values({
      id: msgId,
      conversationId: convId,
      senderId: user.id,
      content: body.content,
    });

    const created = await db.query.message.findFirst({
      where: eq(message.id, msgId),
      with: { sender: { columns: { id: true, name: true, image: true } } },
    });

    return c.json({ conversation: { id: convId }, message: created }, 201);
  } catch (error) {
    console.error("Error starting conversation:", error);
    return c.json({ error: "Failed to start conversation" }, 500);
  }
});

messagingUser.post("/send", async (c) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    if (!body.conversationId || !body.content) {
      return c.json({ error: "conversationId and content are required" }, 400);
    }

    const conv = await db.query.conversation.findFirst({
      where: and(eq(conversation.id, body.conversationId), eq(conversation.userId, user.id)),
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
      with: { sender: { columns: { id: true, name: true, image: true } } },
    });

    return c.json({ message: created }, 201);
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

export default messagingUser;
