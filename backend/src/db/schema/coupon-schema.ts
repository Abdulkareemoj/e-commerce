import { pgTable, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { product } from "./product-schema";
import { category } from "./category-schema";
import { vendor } from "./vendor-schema";

export const coupon = pgTable("coupon", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // "percentage" | "fixed" — validated in coupons.ts, see below
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }), // set only when discountType = "percentage", e.g. 15.00 = 15%
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }), // set only when discountType = "fixed", same unit as product.price (dollars)
  minimumOrderAmount: numeric("minimum_order_amount", { precision: 10, scale: 2 }).default("0"), // renamed from minimumOrderCents — it was always dollars, the name lied
  maxUses: integer("max_uses").default(0),
  currentUses: integer("current_uses").default(0),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  productId: text("product_id").references(() => product.id, { onDelete: "set null" }),
  categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
  vendorId: text("vendor_id").references(() => vendor.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});