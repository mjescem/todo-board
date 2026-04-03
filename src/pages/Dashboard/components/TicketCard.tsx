import { useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { openCardDetail } from "@/features/global/globalSlice";
import type { Ticket } from "@/features/tickets/ticketsApi";
import { useReorderTicketMutation } from "@/features/tickets/ticketsApi";
import { AlignLeft, Clock } from "lucide-react";
import { format, isPast, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";
import { colorPickers } from "@/app/constants";

type Props = {
  ticket: Ticket;
};

let globalDraggedHeight = 60;

const TicketCard: React.FC<Props> = ({ ticket }) => {
  const dispatch = useAppDispatch();
  const [reorderTicket] = useReorderTicketMutation();

  const [dropIndicator, setDropIndicator] = useState<"top" | "bottom" | null>(
    null,
  );

  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    e.stopPropagation();
    e.dataTransfer.setData("ticket", JSON.stringify(ticket));
    e.dataTransfer.effectAllowed = "move";

    globalDraggedHeight = (e.target as HTMLElement).offsetHeight;

    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = "0";
      target.style.height = "0px";
      target.style.minHeight = "0px";
      target.style.padding = "0px";
      target.style.margin = "0px";
      target.style.border = "0px";
      target.style.overflow = "hidden";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = "1";
    target.style.height = "";
    target.style.minHeight = "";
    target.style.padding = "";
    target.style.margin = "";
    target.style.border = "";
    target.style.overflow = "";

    setDropIndicator(null);
  };

  const handleDrop = async (e: React.DragEvent, targetTicket: Ticket) => {
    e.preventDefault();
    e.stopPropagation();

    const indicator = dropIndicator;
    setDropIndicator(null);

    const draggedTicketData = e.dataTransfer.getData("ticket");
    if (!draggedTicketData) return;

    const draggedTicket: Ticket = JSON.parse(draggedTicketData);
    if (draggedTicket.id === targetTicket.id) return;

    const newOrder =
      indicator === "bottom" ? targetTicket.order + 1 : targetTicket.order;

    try {
      await reorderTicket({
        id: draggedTicket.id,
        ticket: draggedTicket,
        sourceCategoryId: draggedTicket.categoryId,
        destinationCategoryId: targetTicket.categoryId,
        newOrder,
      }).unwrap();
    } catch (error) {
      console.error("Failed to reorder ticket:", error);
    }
  };

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetElement = e.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const isBottomHalf = e.clientY - rect.top > rect.height / 2;

    setDropIndicator(isBottomHalf ? "bottom" : "top");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();

    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node | null;

    if (!currentTarget.contains(relatedTarget)) {
      setDropIndicator(null);
    }
  };

  const DropPlaceholder = () => (
    <div
      className="w-full bg-blue-500/15 border-2 border-dashed border-blue-500/80 rounded-lg pointer-events-none transition-all duration-200"
      style={{ height: `${globalDraggedHeight}px` }}
    />
  );

  return (
    <div
      onDragOver={handleTaskDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, ticket)}
      className="flex flex-col gap-2 w-full transition-all duration-200 kanban-drop-zone py-1.5"
    >
      {dropIndicator === "top" && <DropPlaceholder />}
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, ticket)}
        onDragEnd={handleDragEnd}
        onClick={() => dispatch(openCardDetail(ticket.id))}
        className={`cursor-pointer rounded-lg bg-[#2b2c36]/80 p-3 shadow-sm transition-all duration-200 group ${
          dropIndicator ? "opacity-80" : "hover:ring-2 hover:ring-blue-500"
        }`}
      >
        {ticket.color && (
          <div
            className={cn(
              "h-2 w-10 rounded-full mb-2",
              colorPickers.find((c) => c.name.toLowerCase() === ticket.color)
                ?.color || "bg-gray-500",
            )}
          ></div>
        )}
        <div className="flex items-start gap-2">
          <h4 className="text-sm font-medium text-white">{ticket.title}</h4>
        </div>
        {(!!ticket.description || ticket.expiryDate) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-white/70">
            {ticket.expiryDate && (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-1.5 py-0.5 rounded shrink-0",
                  isPast(new Date(ticket.expiryDate))
                    ? "bg-red-500 text-white"
                    : differenceInHours(
                          new Date(ticket.expiryDate),
                          new Date(),
                        ) < 24
                      ? "bg-yellow-500 text-white"
                      : "bg-white/10 text-[#b6c2cf] hover:bg-white/20 transition-colors",
                )}
              >
                <Clock size={12} />
                <span className="text-[10px] font-bold">
                  {format(new Date(ticket.expiryDate), "MMM d")}
                </span>
              </div>
            )}
            {!!ticket.description && (
              <div
                className="flex items-center text-[#9fadbc]"
                title="This card has a description."
              >
                <AlignLeft size={14} strokeWidth={2} />
              </div>
            )}
          </div>
        )}
      </div>
      {dropIndicator === "bottom" && <DropPlaceholder />}
    </div>
  );
};

export default TicketCard;
