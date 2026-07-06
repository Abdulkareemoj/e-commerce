import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { vendor } from "./vendor-schema";

export const payout = pgTable("payout", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  note: text("note"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const payoutRelations = relations(payout, ({ one }) => ({
  vendor: one(vendor, { fields: [payout.vendorId], references: [vendor.id] }),
}));
