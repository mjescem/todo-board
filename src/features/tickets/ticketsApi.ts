import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store";

export interface Ticket {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  isDone: boolean;
  color?: string | null;
}

export interface CreateTicketRequest {
  categoryId: string;
  title: string;
  description?: string;
  color?: string | null;
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
  tagTypes: ["Ticket"],
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
    createTicket: builder.mutation<Ticket, CreateTicketRequest>({
      query: (newTicket) => ({
        url: "/",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: [{ type: "Ticket", id: "TASK" }],
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
      invalidatesTags: (_, __, { id }) => [{ type: "Ticket", id }],
    }),
    deleteTicket: builder.mutation<Ticket, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Ticket", id: "TASK" }],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} = ticketsApi;
