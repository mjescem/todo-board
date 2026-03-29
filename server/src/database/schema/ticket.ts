import { integer, pgTable, varchar, timestamp, text, boolean, uuid } from "drizzle-orm/pg-core";
import { categories } from "./category.js";

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("categoryId")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull().default(""),
  isDraft: boolean().notNull().default(true),
  expiryDate: timestamp(),
  order: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
