import { pgTable, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { product } from "./product-schema";
import { user } from "./auth-schema";

export const review = pgTable("review", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body"),
  isVerifiedPurchase: text("is_verified_purchase").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueProductUser: uniqueIndex("review_product_user_idx").on(table.productId, table.userId),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  product: one(product, {
    fields: [review.productId],
    references: [product.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
}));
