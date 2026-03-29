import { eq, and } from "drizzle-orm";
import { db } from "../../database/index.js";
import { boards } from "../../database/schema/board.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
  type CreateCategoryParams,
  type DeleteCategoryParams,
  type GetCategoriesParams,
  type UpdateCategoryParams,
} from "./categorySchema.js";
import { categories } from "../../database/schema/category.js";

export async function getCategories(params: GetCategoriesParams) {
  const { boardId, ownerId } = getCategoriesSchema.parse(params);

  const [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.ownerId, ownerId)));

  if (!board) throw new Error("Board not found");

  return db
    .select()
    .from(categories)
    .where(eq(categories.boardId, boardId))
    .orderBy(categories.order);
}

export async function createCategory(params: CreateCategoryParams) {
  const { boardId, ownerId, title, color } = createCategorySchema.parse(params);
  const [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.ownerId, ownerId)));

  if (!board) throw new Error("Board not found");

  const existing = await db.select().from(categories).where(eq(categories.boardId, boardId));

  const [category] = await db
    .insert(categories)
    .values({ boardId, title, color, order: existing.length })
    .returning();
  return category;
}

export async function updateCategory(params: UpdateCategoryParams) {
  const { id, ownerId, data } = updateCategorySchema.parse(params);

  const [category] = await db
    .select({ col: categories, ownerId: boards.ownerId })
    .from(categories)
    .innerJoin(boards, eq(categories.boardId, boards.id))
    .where(and(eq(categories.id, id), eq(boards.ownerId, ownerId)));

  if (!category) throw new Error("Category not found");

  const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
  return updated;
}

export async function deleteCategory(params: DeleteCategoryParams) {
  const { id, ownerId } = deleteCategorySchema.parse(params);
  const [category] = await db
    .select({ category: categories, ownerId: boards.ownerId })
    .from(categories)
    .innerJoin(boards, eq(categories.boardId, boards.id))
    .where(and(eq(categories.id, id), eq(boards.ownerId, ownerId)));

  if (!category) throw new Error("Category not found");

  const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
  return deleted;
}
