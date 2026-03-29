import { eq, and } from "drizzle-orm";
import { db } from "../../database/index.js";
import { boards } from "../../database/schema/board.js";
import { createBoardSchema, deleteBoardSchema, getBoardsSchema, updateBoardSchema, type CreateBoardParams, type DeleteBoardParams, type GetBoardsParams, type UpdateBoardParams } from "./boardSchema.js";

export async function getBoards(params: GetBoardsParams) {
  const { ownerId } = getBoardsSchema.parse(params);
  return db.select().from(boards).where(eq(boards.ownerId, ownerId));
}

export async function createBoard(params: CreateBoardParams) {
  const { ownerId, title } = createBoardSchema.parse(params);
  const [board] = await db
    .insert(boards)
    .values({ title, ownerId })
    .returning();
  return board;
}

export async function updateBoard(params: UpdateBoardParams) {
  const { id, ownerId, data } = updateBoardSchema.parse(params);
  const [updated] = await db
    .update(boards)
    .set({ title: data.title })
    .where(and(eq(boards.id, id), eq(boards.ownerId, ownerId)))
    .returning();

  if (!updated) {
    throw new Error("Board not found");
  }
  return updated;
}

export async function deleteBoard(params: DeleteBoardParams) {
  const { id, ownerId } = deleteBoardSchema.parse(params);
  const [deleted] = await db
    .delete(boards)
    .where(and(eq(boards.id, id), eq(boards.ownerId, ownerId)))
    .returning();

  if (!deleted) {
    throw new Error("Board not found");
  }
  return deleted;
}