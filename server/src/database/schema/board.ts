import { pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.js";

export const boards = pgTable("boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar({ length: 255 }).notNull(),
  ownerId: uuid("ownerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
});
