import { z } from "zod";

export const getTicketsSchema = z.object({
  categoryId: z.uuid(),
  ownerId: z.uuid(),
});

export const getTicketSchema = z.object({
  id: z.uuid("Invalid ticket ID"),
  ownerId: z.uuid("Invalid owner ID"),
});

export const createTicketSchema = z.object({
  categoryId: z.uuid("Invalid category ID"),
  ownerId: z.uuid("Invalid owner ID"),
  data: z.object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
    isDraft: z.boolean().optional(),
    color: z.string().optional().nullable(),
  }),
});

export const updateTicketSchema = z.object({
  id: z.uuid("Invalid ticket ID"),
  ownerId: z.uuid("Invalid owner ID"),
  data: z
    .object({
      title: z.string().min(1, "Title is required").max(100).optional(),
      description: z.string().optional(),
      expiryDate: z.string().optional().nullable(),
      isDraft: z.boolean().optional(),
      color: z.string().optional().nullable(),
    })
    .refine(
      (data) =>
        data.title !== undefined ||
        data.description !== undefined ||
        data.expiryDate !== undefined ||
        data.isDraft !== undefined ||
        data.color !== undefined,
      {
        message: "At least one property must be updated",
      },
    ),
});

export const deleteTicketSchema = z.object({
  id: z.uuid("Invalid ticket ID"),
  ownerId: z.uuid("Invalid owner ID"),
});

export type GetTicketsParams = z.infer<typeof getTicketsSchema>;
export type GetTicketParams = z.infer<typeof getTicketSchema>;
export type CreateTicketParams = z.infer<typeof createTicketSchema>;
export type UpdateTicketParams = z.infer<typeof updateTicketSchema>;
export type DeleteTicketParams = z.infer<typeof deleteTicketSchema>;
