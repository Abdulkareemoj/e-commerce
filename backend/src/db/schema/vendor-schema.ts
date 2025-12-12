import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const vendor = pgTable("vendor", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  storeName: text("store_name").notNull(),
  storeSlug: text("store_slug").notNull().unique(), // for easy public linking
  description: text("description"),
  payoutDetails: text("payout_details"), // e.g., Stripe/Paystack account ID or bank details (sensitive data, simplified for schema)
  isVerified: text("is_verified").default("pending").notNull(), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
