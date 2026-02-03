import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const profile = pgTable("profile", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
