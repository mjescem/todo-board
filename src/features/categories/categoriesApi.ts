import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store";

export interface Category {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface CreateCategoryRequest {
  boardId: string;
  title: string;
}

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/categories",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], { boardId: string }>({
      query: ({ boardId }) => `/?boardId=${boardId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (newCategory) => ({
        url: "/",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
    updateCategory: builder.mutation<Category, { id: string; title?: string }>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Category", id }],
    }),
    deleteCategory: builder.mutation<Category, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
    reorderCategory: builder.mutation<
      Category,
      { id: string; boardId: string; newOrder: number }
    >({
      query: (data) => ({
        url: "/reorder",
        method: "POST",
        body: {
          id: data.id,
          newOrder: data.newOrder,
        },
      }),

      async onQueryStarted(
        { id, boardId, newOrder },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          categoriesApi.util.updateQueryData(
            "getCategories",
            { boardId },
            (draft) => {
              const categoryIndex = draft.findIndex((c) => c.id === id);
              if (categoryIndex === -1) return;

              const [removed] = draft.splice(categoryIndex, 1);
              const insertIndex = Math.min(newOrder, draft.length);
              draft.splice(insertIndex, 0, removed);
              draft.forEach((c, idx) => {
                c.order = idx;
              });
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },

      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoryMutation
} = categoriesApi;
