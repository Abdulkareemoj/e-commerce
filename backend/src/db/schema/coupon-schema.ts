import { pgTable, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { product } from "./product-schema";
import { category } from "./category-schema";
import { vendor } from "./vendor-schema";

export const coupon = pgTable("coupon", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // "percentage" | "fixed"
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumOrderCents: integer("minimum_order_cents").default(0),
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
