import * as z from "zod";

export const getCategoriesSchema = z.object({
  boardId: z.uuid("Invalid board ID"),
  ownerId: z.uuid("Invalid owner ID"),
});

export const createCategorySchema = z.object({
  boardId: z.uuid("Invalid board ID"),
  ownerId: z.uuid("Invalid owner ID"),
  title: z.string().min(1, "Title is required").max(100),
});

export const updateCategorySchema = z.object({
  id: z.uuid("Invalid category ID"),
  ownerId: z.uuid("Invalid owner ID"),
  data: z
    .object({
      title: z
        .string()
        .min(1, "Title cannot be empty")
        .max(100, "Title must be 100 characters or less")
        .optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      {
        message: "You must provide at least one field to update",
      },
    ),
});

export const deleteCategorySchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
});

export type GetCategoriesParams = z.infer<typeof getCategoriesSchema>;
export type CreateCategoryParams = z.infer<typeof createCategorySchema>;
export type UpdateCategoryParams = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryParams = z.infer<typeof deleteCategorySchema>;
