import { eq, and, sql } from "drizzle-orm";
import { db } from "../../database/index.js";
import { tickets } from "../../database/schema/ticket.js";
import { categories } from "../../database/schema/category.js";
import { boards } from "../../database/schema/board.js";
import {
  createTicketSchema,
  deleteTicketSchema,
  getTicketSchema,
  getTicketsSchema,
  reorderTicketSchema,
  updateTicketSchema,
  type CreateTicketParams,
  type DeleteTicketParams,
  type GetTicketParams,
  type GetTicketsParams,
  type ReorderTicketParams,
  type UpdateTicketParams,
} from "./ticketSchema.js";
import { recordActivity } from "../ticketActivity/ticketActivity.service.js";

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
  return db
    .select()
    .from(tickets)
    .where(eq(tickets.categoryId, categoryId))
    .orderBy(tickets.order);
}

export async function getTicket(params: GetTicketParams) {
  const { id, ownerId } = getTicketSchema.parse(params);

  const [ticket] = await db
    .select({ ticket: tickets })
    .from(tickets)
    .innerJoin(categories, eq(tickets.categoryId, categories.id))
    .innerJoin(boards, eq(categories.boardId, boards.id))
    .where(and(eq(tickets.id, id), eq(boards.ownerId, ownerId)));

  if (!ticket) throw new Error("Ticket not found");
  return ticket.ticket;
}

export async function createTicket(params: CreateTicketParams) {
  const { categoryId, ownerId, data } = createTicketSchema.parse(params);
  const category = await verifyCategoryOwnership(categoryId, ownerId);

  const existing = await db
    .select()
    .from(tickets)
    .where(eq(tickets.categoryId, categoryId));

  const [ticket] = await db
    .insert(tickets)
    .values({
      categoryId,
      title: data.title,
      description: data.description ?? "",
      isDraft: data.isDraft ?? true,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      color: data.color ?? null,
      order: existing.length,
    })
    .returning();

  if (!ticket) throw new Error("Failed to create ticket");

  await recordActivity({
    ticketId: ticket.id,
    userId: ownerId,
    action: "created",
    meta: { categoryName: category.title },
  });

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
      ...(data.color !== undefined && { color: data.color }),
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();

  if (data.title !== undefined) {
    await recordActivity({
      ticketId: id,
      userId: ownerId,
      action: "title_changed",
      meta: { from: ticket.ticket.title, to: data.title },
    });
  }
  if (data.description !== undefined) {
    await recordActivity({
      ticketId: id,
      userId: ownerId,
      action: "description_changed",
      meta: {},
    });
  }
  if (data.color !== undefined) {
    await recordActivity({
      ticketId: id,
      userId: ownerId,
      action: "color_changed",
      meta: {
        from: ticket.ticket.color ?? "",
        to: data.color ?? "",
      },
    });
  }

  if (data.expiryDate !== undefined) {
    if (data.expiryDate !== ticket.ticket.expiryDate?.toISOString()) {
      await recordActivity({
        ticketId: id,
        userId: ownerId,
        action: "expiry_date_changed",
        meta: {
          from: ticket.ticket.expiryDate
            ? ticket.ticket.expiryDate.toISOString()
            : "",
          to: data.expiryDate ?? "",
        },
      });
    }
  }

  if (data.isDraft !== undefined) {
    await recordActivity({
      ticketId: id,
      userId: ownerId,
      action: "status_changed",
      meta: {
        from: ticket.ticket.isDraft ? "draft" : "published",
        to: data.isDraft ? "draft" : "published",
      },
    });
  }

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

  const [deleted] = await db
    .delete(tickets)
    .where(eq(tickets.id, id))
    .returning();
  return deleted;
}

export async function reorderTicket(params: ReorderTicketParams) {
  const { id, ownerId, destinationCategoryId, newOrder } =
    reorderTicketSchema.parse(params);

  return await db.transaction(async (tx) => {
    const [ticket] = await tx
      .select({ ticket: tickets, ownerId: boards.ownerId })
      .from(tickets)
      .innerJoin(categories, eq(tickets.categoryId, categories.id))
      .innerJoin(boards, eq(categories.boardId, boards.id))
      .where(and(eq(tickets.id, id), eq(boards.ownerId, ownerId)));

    if (!ticket) throw new Error("Ticket not found");

    const sourceCategoryId = ticket.ticket.categoryId;
    const oldOrder = ticket.ticket.order;

    if (sourceCategoryId === destinationCategoryId) {
      if (oldOrder === newOrder) return ticket.ticket;

      if (newOrder > oldOrder) {
        await tx
          .update(tickets)
          .set({ order: sql`${tickets.order} - 1` })
          .where(
            and(
              eq(tickets.categoryId, sourceCategoryId),
              sql`${tickets.order} > ${oldOrder}`,
              sql`${tickets.order} <= ${newOrder}`,
            ),
          );
      } else {
        await tx
          .update(tickets)
          .set({ order: sql`${tickets.order} + 1` })
          .where(
            and(
              eq(tickets.categoryId, sourceCategoryId),
              sql`${tickets.order} >= ${newOrder}`,
              sql`${tickets.order} < ${oldOrder}`,
            ),
          );
      }
    } else {
      await tx
        .update(tickets)
        .set({ order: sql`${tickets.order} - 1` })
        .where(
          and(
            eq(tickets.categoryId, sourceCategoryId),
            sql`${tickets.order} > ${oldOrder}`,
          ),
        );

      await tx
        .update(tickets)
        .set({ order: sql`${tickets.order} + 1` })
        .where(
          and(
            eq(tickets.categoryId, destinationCategoryId),
            sql`${tickets.order} >= ${newOrder}`,
          ),
        );
    }

    const [updated] = await tx
      .update(tickets)
      .set({
        categoryId: destinationCategoryId,
        order: newOrder,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();

    if (sourceCategoryId !== destinationCategoryId) {
      const [sourceCategory] = await db
        .select({ title: categories.title })
        .from(categories)
        .where(eq(categories.id, sourceCategoryId));

      const [destinationCategory] = await db
        .select({ title: categories.title })
        .from(categories)
        .where(eq(categories.id, destinationCategoryId));

      await recordActivity({
        ticketId: id,
        userId: ownerId,
        action: "category_moved",
        meta: {
          from: sourceCategory?.title ?? sourceCategoryId,
          to: destinationCategory?.title ?? destinationCategoryId,
        },
      });
    }

    return updated;
  });
}
