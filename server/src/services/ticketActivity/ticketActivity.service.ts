import { eq, desc, and } from "drizzle-orm";
import { db } from "../../database/index.js";
import { ticketActivities } from "../../database/schema/ticketActivity.js";
import { tickets } from "../../database/schema/ticket.js";
import { categories } from "../../database/schema/category.js";
import { boards } from "../../database/schema/board.js";
import { users } from "../../database/schema/user.js";
import {
  getTicketActivitiesSchema,
  recordActivitySchema,
  type GetTicketActivitiesParams,
  type RecordActivityParams,
} from "./ticketActivitySchema.js";

export async function getTicketActivities(params: GetTicketActivitiesParams) {
  const { ticketId, ownerId } = getTicketActivitiesSchema.parse(params);

  const [ticketRow] = await db
    .select({ ticketId: tickets.id })
    .from(tickets)
    .innerJoin(categories, eq(tickets.categoryId, categories.id))
    .innerJoin(boards, eq(categories.boardId, boards.id))
    .where(and(eq(tickets.id, ticketId), eq(boards.ownerId, ownerId)));

  if (!ticketRow) throw new Error("Ticket not found");

  const rows = await db
    .select({
      id: ticketActivities.id,
      ticketId: ticketActivities.ticketId,
      action: ticketActivities.action,
      meta: ticketActivities.meta,
      createdAt: ticketActivities.createdAt,
      userName: users.name,
    })
    .from(ticketActivities)
    .innerJoin(users, eq(ticketActivities.userId, users.id))
    .where(eq(ticketActivities.ticketId, ticketId))
    .orderBy(desc(ticketActivities.createdAt));

  return rows.map((row) => ({
    ...row,
    user: {
      name: row.userName,
      initials: row.userName
        .split(" ")
        .map((part) => part[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join(""),
    },
  }));
}

export async function recordActivity(params: RecordActivityParams) {
  const { ticketId, userId, action, meta } = recordActivitySchema.parse(params);

  const [activity] = await db
    .insert(ticketActivities)
    .values({ ticketId, userId, action, meta })
    .returning();

  return activity;
}
