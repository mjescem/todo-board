import { Bell, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useExpiryNotifications } from "@/lib/hooks/useExpiryNotifications";
import { isPast, differenceInHours, format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const upcomingTickets = useExpiryNotifications();

  const overdueCount = upcomingTickets.filter((t) =>
    isPast(new Date(t.expiryDate)),
  ).length;
  const hasNotifications = upcomingTickets.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative text-gray-400 hover:text-primary transition-colors cursor-pointer">
          <Bell size={20} />
          {hasNotifications && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white leading-none",
                overdueCount > 0 ? "bg-red-500" : "bg-amber-400",
              )}
            >
              {upcomingTickets.length}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 bg-white border border-gray-200 shadow-xl rounded-xl"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-800">Notifications</span>
          {hasNotifications && (
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {upcomingTickets.length} upcoming
            </span>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {!hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-semibold text-gray-700">
                You're all caught up!
              </p>
              <p className="text-xs text-gray-400">
                No upcoming deadlines within 48 hours.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcomingTickets.map((ticket) => {
                const date = new Date(ticket.expiryDate);
                const isOverdue = isPast(date);
                const hoursLeft = differenceInHours(date, new Date());

                return (
                  <li key={ticket.id}>
                    <button
                      onClick={() =>
                        navigate(
                          `/boards/${ticket.boardId}/tickets/${ticket.id}`,
                        )
                      }
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="mt-0.5 shrink-0">
                        <Clock
                          size={15}
                          className={
                            isOverdue ? "text-red-500" : "text-amber-500"
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {ticket.title}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 mb-0.5 truncate">
                          {ticket.boardTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(date, "MMM d 'at' h:mm a")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 self-center text-[10px] font-black px-1.5 py-0.5 rounded",
                          isOverdue
                            ? "bg-red-100 text-red-600"
                            : hoursLeft < 6
                              ? "bg-orange-100 text-orange-600"
                              : "bg-amber-100 text-amber-600",
                        )}
                      >
                        {isOverdue
                          ? "Overdue"
                          : hoursLeft < 1
                            ? "< 1h"
                            : `${hoursLeft}h`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;
