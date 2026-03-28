import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { categories } from "./category.js";

export const tickets = pgTable("tickets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer()
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
