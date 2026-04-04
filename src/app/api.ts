import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: createCustomBaseQuery("/api"),
  tagTypes: ["Board", "Category", "Ticket", "TicketActivity", "UpcomingTicket"],
  endpoints: () => ({}),
});
