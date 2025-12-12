import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { vendor } from "./vendor-schema";

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendor.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  images: text("images").array(), // Array of image URLs cos obviously its more than one image
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const productRelations = relations(product, ({ one }) => ({
  vendor: one(vendor, {
    fields: [product.vendorId],
    references: [vendor.id],
  }),
}));
