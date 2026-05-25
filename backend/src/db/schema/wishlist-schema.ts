import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";
import { product } from "./product-schema";

export const wishlistItem = pgTable("wishlist_item", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserProduct: uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId),
}));

export const wishlistRelations = relations(wishlistItem, ({ one }) => ({
  user: one(user, {
    fields: [wishlistItem.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [wishlistItem.productId],
    references: [product.id],
  }),
}));
