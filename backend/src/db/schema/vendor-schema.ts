import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const vendorStatusEnum = pgEnum("vendor_status", [
  "pending",
  "approved",
  "rejected",
]);

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
  isVerified: vendorStatusEnum("is_verified").default("pending").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
