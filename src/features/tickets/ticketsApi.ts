import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store";

export interface Ticket {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  isDone: boolean;
  color?: string | null;
  order: number;
}

export interface CreateTicketRequest {
  categoryId: string;
  title: string;
  description?: string;
  color?: string | null;
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
    | "status_changed";
  meta: Record<string, string>;
  createdAt: string;
  user: { name: string; initials: string };
}

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/tickets",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Ticket", "TicketActivity"],
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], { categoryId: string }>({
      query: ({ categoryId }) => `/?categoryId=${categoryId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Ticket" as const, id })),
              { type: "Ticket", id: "TASK" },
            ]
          : [{ type: "Ticket", id: "TASK" }],
    }),
    getTicket: builder.query<Ticket, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: "Ticket", id }],
    }),
    createTicket: builder.mutation<Ticket, CreateTicketRequest>({
      query: (newTicket) => ({
        url: "/",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Ticket", id: "TASK" },
              { type: "TicketActivity", id: result.id },
            ]
          : [{ type: "Ticket", id: "TASK" }],
    }),
    updateTicket: builder.mutation<
      Ticket,
      {
        id: string;
        title?: string;
        description?: string;
        isDone?: boolean;
        color?: string | null;
      }
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Ticket", id },
        { type: "TicketActivity", id },
      ],
    }),
    deleteTicket: builder.mutation<Ticket, string>({
      query: (id) => ({
        url: `/${id}`,
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
        url: "/reorder",
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

      invalidatesTags: ["Ticket"],
    }),
    getTicketActivities: builder.query<TicketActivity[], string>({
      query: (ticketId) => `/${ticketId}/activities`,
      providesTags: (_, __, ticketId) => [
        { type: "TicketActivity", id: ticketId },
      ],
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
} = ticketsApi;
