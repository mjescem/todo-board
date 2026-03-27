import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getErrorMessage(error: FetchBaseQueryError | SerializedError): string | null {
  if (!error) return null;

  if (typeof error === "object" && "status" in error && "data" in error) {
    const errData = error.data as { error?: string };

    if (errData?.error) {
      return errData.error;
    }
  }

  return "Something went wrong. Please try again.";
}
