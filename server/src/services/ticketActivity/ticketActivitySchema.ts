import * as z from "zod";

export const getTicketActivitiesSchema = z.object({
  ticketId: z.uuid("Invalid ticket ID"),
  ownerId: z.uuid("Invalid owner ID"),
});

export const recordActivitySchema = z.object({
  ticketId: z.uuid("Invalid ticket ID"),
  userId: z.uuid("Invalid user ID"),
  action: z.enum([
    "created",
    "title_changed",
    "description_changed",
    "color_changed",
    "category_moved",
    "status_changed",
    "expiry_date_changed",
  ]),
  meta: z.record(z.string(), z.unknown()).default({}),
});

export type GetTicketActivitiesParams = z.infer<
  typeof getTicketActivitiesSchema
>;
export type RecordActivityParams = z.infer<typeof recordActivitySchema>;
