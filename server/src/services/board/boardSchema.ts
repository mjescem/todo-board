import * as z from "zod";

export const getBoardsSchema = z.object({
  ownerId: z.uuid(),
});

export const createBoardSchema = z.object({
  ownerId: z.uuid(),
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
});

export const updateBoardSchema = z.object({
  id: z.uuid("Invalid board ID"),
  ownerId: z.uuid(),
  data: z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  }),
});

export const deleteBoardSchema = z.object({
  id: z.uuid("Invalid board ID"),
  ownerId: z.uuid(),
});

export type GetBoardsParams = z.infer<typeof getBoardsSchema>;
export type CreateBoardParams = z.infer<typeof createBoardSchema>;
export type UpdateBoardParams = z.infer<typeof updateBoardSchema>;
export type DeleteBoardParams = z.infer<typeof deleteBoardSchema>;
