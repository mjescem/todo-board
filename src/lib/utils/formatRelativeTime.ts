import { formatDistanceToNow } from "date-fns";

export function formatRelativeTime(date: Date | string): string {
  const then = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(then, { addSuffix: true });
}
