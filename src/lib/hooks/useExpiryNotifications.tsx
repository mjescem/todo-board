import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { isPast, differenceInHours, format } from "date-fns";
import { useGetUpcomingTicketsQuery } from "@/features/tickets/ticketsApi";

const SESSION_KEY = "expiry_notified";

export function useExpiryNotifications() {
  const { data: upcomingTickets } = useGetUpcomingTicketsQuery(undefined, {
    pollingInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });
  const hasNotified = useRef(false);
  
  useEffect(() => {
    if (!upcomingTickets || upcomingTickets.length === 0) return;
    if (hasNotified.current) return;

    if (sessionStorage.getItem(SESSION_KEY)) return;

    const overdueCount = upcomingTickets.filter((t) =>
      isPast(new Date(t.expiryDate)),
    ).length;

    const soonCount = upcomingTickets.length - overdueCount;

    if (upcomingTickets.length === 1) {
      const ticket = upcomingTickets[0];
      const date = new Date(ticket.expiryDate);
      const isOverdue = isPast(date);
      const hoursLeft = differenceInHours(date, new Date());

      if (isOverdue) {
        toast.error(`"${ticket.title}" is overdue!`, {
          description: `Was due ${format(date, "MMM d 'at' h:mm a")}`,
          duration: 10000,
        });
      } else {
        toast.warning(`"${ticket.title}" is due in ${hoursLeft}h`, {
          description: `Due ${format(date, "MMM d 'at' h:mm a")}`,
          duration: 10000,
        });
      }
    } else {
      const parts: string[] = [];
      if (overdueCount > 0) parts.push(`${overdueCount} overdue`);
      if (soonCount > 0) parts.push(`${soonCount} due soon`);

      toast.warning(`You have ${upcomingTickets.length} upcoming deadlines`, {
        description: parts.join(" · "),
        duration: 10000,
      });
    }

    hasNotified.current = true;
    sessionStorage.setItem(SESSION_KEY, "true");
  }, [upcomingTickets]);

  return upcomingTickets ?? [];
}
