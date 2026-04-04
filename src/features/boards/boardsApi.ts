import { api } from "@/app/api";

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
}

export interface CreateBoardRequest {
  title: string;
}

export const boardsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      query: () => "/boards",
      providesTags: ["Board"],
    }),
    createBoard: builder.mutation<Board, CreateBoardRequest>({
      query: (newBoard) => ({
        url: "/boards",
        method: "POST",
        body: newBoard,
      }),
      invalidatesTags: ["Board"],
    }),
    updateBoard: builder.mutation<Board, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `/boards/${id}`,
        method: "PATCH",
        body: { title },
      }),
      invalidatesTags: ["Board"],
    }),
    deleteBoard: builder.mutation<Board, string>({
      query: (id) => ({
        url: `/boards/${id}`,
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
