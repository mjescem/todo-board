import * as z from "zod";

export const getCategoriesSchema = z.object({
  boardId: z.uuid(),
  ownerId: z.uuid(),
});

export const createCategorySchema = z.object({
  boardId: z.uuid(),
  ownerId: z.uuid(),
  title: z.string().min(1, "Title is required").max(100),
  color: z.string().optional().default("#6366f1"),
});

export const updateCategorySchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  data: z
    .object({
      title: z.string().min(1, "Title is required").max(100).optional(),
      color: z.string().optional(),
    })
    .refine((data) => data.title !== undefined || data.color !== undefined, {
      message: "At least one property must be updated",
    }),
});

export const deleteCategorySchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
});

export type GetCategoriesParams = z.infer<typeof getCategoriesSchema>;
export type CreateCategoryParams = z.infer<typeof createCategorySchema>;
export type UpdateCategoryParams = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryParams = z.infer<typeof deleteCategorySchema>;
