import { eq, and } from "drizzle-orm";
import { db } from "../../database/index.js";
import { tickets } from "../../database/schema/ticket.js";
import { categories } from "../../database/schema/category.js";
import { boards } from "../../database/schema/board.js";
import {
  createTicketSchema,
  deleteTicketSchema,
  getTicketsSchema,
  updateTicketSchema,
  type CreateTicketParams,
  type DeleteTicketParams,
  type GetTicketsParams,
  type UpdateTicketParams,
} from "./ticketSchema.js";

async function verifyCategoryOwnership(categoryId: string, ownerId: string) {
  const [category] = await db
    .select({ category: categories, ownerId: boards.ownerId })
    .from(categories)
    .innerJoin(boards, eq(categories.boardId, boards.id))
    .where(and(eq(categories.id, categoryId), eq(boards.ownerId, ownerId)));

  if (!category) throw new Error("Category not found");
  return category.category;
}

export async function getTickets(params: GetTicketsParams) {
  const { categoryId, ownerId } = getTicketsSchema.parse(params);
  await verifyCategoryOwnership(categoryId, ownerId);
  return db.select().from(tickets).where(eq(tickets.categoryId, categoryId)).orderBy(tickets.order);
}

export async function createTicket(params: CreateTicketParams) {
  const { categoryId, ownerId, data } = createTicketSchema.parse(params);
  await verifyCategoryOwnership(categoryId, ownerId);

  const existing = await db.select().from(tickets).where(eq(tickets.categoryId, categoryId));

  const [ticket] = await db
    .insert(tickets)
    .values({
      categoryId,
      title: data.title,
      description: data.description ?? "",
      isDraft: data.isDraft ?? true,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      order: existing.length,
    })
    .returning();
  return ticket;
}

export async function updateTicket(params: UpdateTicketParams) {
  const { id, ownerId, data } = updateTicketSchema.parse(params);

  const [ticket] = await db
    .select({ ticket: tickets, ownerId: boards.ownerId })
    .from(tickets)
    .innerJoin(categories, eq(tickets.categoryId, categories.id))
    .innerJoin(boards, eq(categories.boardId, boards.id))
    .where(and(eq(tickets.id, id), eq(boards.ownerId, ownerId)));

  if (!ticket) throw new Error("Ticket not found");

  const [updated] = await db
    .update(tickets)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isDraft !== undefined && { isDraft: data.isDraft }),
      ...(data.expiryDate !== undefined && {
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      }),
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();
  return updated;
}

export async function deleteTicket(params: DeleteTicketParams) {
  const { id, ownerId } = deleteTicketSchema.parse(params);

  const [ticket] = await db
    .select({ ticket: tickets, ownerId: boards.ownerId })
    .from(tickets)
    .innerJoin(categories, eq(tickets.categoryId, categories.id))
    .innerJoin(boards, eq(categories.boardId, boards.id))
    .where(and(eq(tickets.id, id), eq(boards.ownerId, ownerId)));

  if (!ticket) throw new Error("Ticket not found");

  const [deleted] = await db.delete(tickets).where(eq(tickets.id, id)).returning();
  return deleted;
}
