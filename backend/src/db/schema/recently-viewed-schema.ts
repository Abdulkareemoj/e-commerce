import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { product } from "./product-schema";

export const recentlyViewed = pgTable(
  "recently_viewed",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  },
  (table) => [
    // one row per user+product — re-viewing updates the timestamp instead of duplicating
    uniqueIndex("recently_viewed_user_product_idx").on(table.userId, table.productId),
  ],
);