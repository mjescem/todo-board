import { pgTable, uuid, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { tickets } from "./ticket.js";
import { users } from "./user.js";

export const ticketActivities = pgTable("ticket_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticketId")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: varchar({ length: 50 }).notNull(),
  meta: json("meta").notNull().default({}),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
