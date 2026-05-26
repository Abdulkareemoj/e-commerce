import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";
import { vendor } from "./vendor-schema";

export const conversation = pgTable("conversation", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  vendor: one(vendor, { fields: [conversation.vendorId], references: [vendor.id] }),
  user: one(user, { fields: [conversation.userId], references: [user.id] }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, { fields: [message.conversationId], references: [conversation.id] }),
  sender: one(user, { fields: [message.senderId], references: [user.id] }),
}));
