import type { Ticket } from "@/features/tickets/ticketsApi";
import { AlignLeft } from "lucide-react";

type Props = { ticket: Ticket };

const TicketCard: React.FC<Props> = ({ ticket }) => {
  return (
    <div
      key={ticket.id}
      className="cursor-pointer rounded-lg bg-white/20 p-3 shadow-sm hover:ring-2 hover:ring-blue-500"
    >
      {ticket.color && (
        <div className={`h-2 w-10 rounded-full mb-2 ${ticket.color}`}></div>
      )}
      <div className="flex items-start gap-2">
        <h4 className="text-sm font-medium text-white">{ticket.title}</h4>
      </div>
      {!!ticket.description && (
        <div className="flex items-center gap-2 mt-3 text-white">
          <AlignLeft size={16} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
};

export default TicketCard;
