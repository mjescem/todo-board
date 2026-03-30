import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store";

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
}

export interface CreateBoardRequest {
  title: string;
}

export const boardsApi = createApi({
  reducerPath: "boardsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/boards",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Board"],
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      query: () => "/",
      providesTags: ["Board"],
    }),
    createBoard: builder.mutation<Board, CreateBoardRequest>({
      query: (newBoard) => ({
        url: "/",
        method: "POST",
        body: newBoard,
      }),
      invalidatesTags: ["Board"],
    }),
    updateBoard: builder.mutation<Board, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: { title },
      }),
      invalidatesTags: ["Board"],
    }),
    deleteBoard: builder.mutation<Board, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Board"],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} = boardsApi;
