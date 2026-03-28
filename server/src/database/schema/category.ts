import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { boards } from "./board.js";

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  boardId: integer()
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 10 }).notNull().default("#6366f1"),
  order: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
});
