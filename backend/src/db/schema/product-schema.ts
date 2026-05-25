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
import { category } from "./category-schema";
import { productVariant } from "./product-variant-schema";

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
  categoryId: text("category_id").references(() => category.id),
  images: text("images").array(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const productRelations = relations(product, ({ one, many }) => ({
  vendor: one(vendor, {
    fields: [product.vendorId],
    references: [vendor.id],
  }),
  variants: many(productVariant),
}));
