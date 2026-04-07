import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "./store";
import { logout } from "@/features/auth/authSlice";
import { toast } from "sonner";

let isLoggingOut = false;

export const createCustomBaseQuery = (
  baseUrl: string,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
       const url = typeof args === "string" ? args : args.url;
       const isAuthRoute =
         url.includes("/auth/login") || url.includes("/auth/signup");

       if (!isAuthRoute && !isLoggingOut) {
         isLoggingOut = true;

         api.dispatch(logout());

         toast.error("Session Expired", {
           description: "Your session has expired. Please log in again.",
           duration: 5000,
         });

         setTimeout(() => {
           isLoggingOut = false;
         }, 1000);
       }
    }

    return result;
  };
};
