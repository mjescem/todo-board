import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.js";

export const boards = pgTable("boards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  ownerId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
});
