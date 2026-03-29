import { integer, pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { boards } from "./board.js";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("boardId")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 50 }).notNull().default("#6366f1"),
  order: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
});
