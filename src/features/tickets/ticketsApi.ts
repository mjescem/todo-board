import { api } from "@/app/api";

export interface Ticket {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  isDraft: boolean;
  color?: string | null;
  expiryDate?: string | null;
  order: number;
}

export interface CreateTicketRequest {
  categoryId: string;
  title: string;
  description?: string;
  color?: string | null;
  expiryDate?: string | null;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  action:
    | "created"
    | "title_changed"
    | "description_changed"
    | "color_changed"
    | "category_moved"
    | "status_changed"
    | "expiry_date_changed";
  meta: Record<string, string>;
  createdAt: string;
  user: { name: string; initials: string };
}

export interface UpcomingTicket {
  id: string;
  title: string;
  expiryDate: string;
  categoryId: string;
}

export const ticketsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], { categoryId: string }>({
      query: ({ categoryId }) => `/tickets?categoryId=${categoryId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Ticket" as const, id })),
              { type: "Ticket", id: "TASK" },
            ]
          : [{ type: "Ticket", id: "TASK" }],
    }),
    getTicket: builder.query<Ticket, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_, __, id) => [{ type: "Ticket", id }],
    }),
    createTicket: builder.mutation<Ticket, CreateTicketRequest>({
      query: (newTicket) => ({
        url: "/tickets",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Ticket", id: "TASK" },
              { type: "TicketActivity", id: result.id },
              { type: "UpcomingTicket", id: "LIST" },
            ]
          : [
              { type: "Ticket", id: "TASK" },
              { type: "UpcomingTicket", id: "LIST" },
            ],
    }),
    updateTicket: builder.mutation<
      Ticket,
      {
        id: string;
        title?: string;
        description?: string;
        isDraft?: boolean;
        color?: string | null;
        expiryDate?: string | null;
      }
    >({
      query: ({ id, ...patch }) => ({
        url: `/tickets/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Ticket", id },
        { type: "TicketActivity", id },
        { type: "UpcomingTicket", id: "LIST" },
      ],
    }),
    deleteTicket: builder.mutation<Ticket, string>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Ticket", id: "TASK" }],
    }),
    reorderTicket: builder.mutation<
      Ticket,
      {
        id: string;
        ticket: Ticket;
        sourceCategoryId: string;
        destinationCategoryId: string;
        newOrder: number;
      }
    >({
      query: (body) => ({
        url: "/tickets/reorder",
        method: "POST",
        body: {
          id: body.id,
          destinationCategoryId: body.destinationCategoryId,
          newOrder: body.newOrder,
        },
      }),

      async onQueryStarted(
        { id, ticket, sourceCategoryId, destinationCategoryId, newOrder },
        { dispatch, queryFulfilled },
      ) {
        const patchSource = dispatch(
          ticketsApi.util.updateQueryData(
            "getTickets",
            { categoryId: sourceCategoryId },
            (draft) => {
              const ticketIndex = draft.findIndex((t) => t.id === id);
              if (ticketIndex === -1) return;

              const [removed] = draft.splice(ticketIndex, 1);

              if (sourceCategoryId === destinationCategoryId) {
                const insertIndex = Math.min(newOrder, draft.length);
                draft.splice(insertIndex, 0, removed);
                draft.forEach((t, idx) => {
                  t.order = idx;
                });
              }
            },
          ),
        );

        let patchDestination;
        if (sourceCategoryId !== destinationCategoryId) {
          patchDestination = dispatch(
            ticketsApi.util.updateQueryData(
              "getTickets",
              { categoryId: destinationCategoryId },
              (draft) => {
                const updatedTicket = {
                  ...ticket,
                  categoryId: destinationCategoryId,
                  order: newOrder,
                };

                const insertIndex = Math.min(newOrder, draft.length);
                draft.splice(insertIndex, 0, updatedTicket);
                draft.forEach((t, idx) => {
                  t.order = idx;
                });
              },
            ),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchSource.undo();
          patchDestination?.undo();
        }
      },

      invalidatesTags: (_, __, { id }) => [
        { type: "Ticket", id },
        { type: "TicketActivity", id },
      ],
    }),
    getTicketActivities: builder.query<TicketActivity[], string>({
      query: (ticketId) => `/tickets/${ticketId}/activities`,
      providesTags: (_, __, ticketId) => [
        { type: "TicketActivity", id: ticketId },
      ],
    }),
    getUpcomingTickets: builder.query<UpcomingTicket[], void>({
      query: () => "/tickets/upcoming",
      providesTags: [{ type: "UpcomingTicket", id: "LIST" }],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useReorderTicketMutation,
  useGetTicketActivitiesQuery,
  useGetUpcomingTicketsQuery,
} = ticketsApi;
