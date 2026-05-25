import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";
import { vendor } from "./vendor-schema";
import { product } from "./product-schema";
import { productVariant } from "./product-variant-schema";
import { address } from "./address-schema";

export const order = pgTable("order", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: text("shipping_address_id").references(() => address.id, { onDelete: "set null" }),
  trackingNumber: text("tracking_number"),
  couponCode: text("coupon_code"),
  discountCents: integer("discount_cents").default(0),
  statusHistory: text("status_history"), // JSON array of {status, timestamp, note}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItem = pgTable("order_item", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => product.id, {
    onDelete: "cascade",
  }),
  variantId: text("variant_id").references(() => productVariant.id, {
    onDelete: "set null",
  }),
  variantSnapshot: text("variant_snapshot"),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, shipped, delivered, cancelled
});

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
  vendor: one(vendor, {
    fields: [orderItem.vendorId],
    references: [vendor.id],
  }),
}));
