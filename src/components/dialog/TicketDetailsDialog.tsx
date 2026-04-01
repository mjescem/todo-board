import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { closeCardDetail } from "@/features/global/globalSlice";
import {
  useGetTicketQuery,
  useUpdateTicketMutation,
} from "@/features/tickets/ticketsApi";
import { useGetCategoriesQuery } from "@/features/categories/categoriesApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlignLeft, MessageSquare, ChevronDown, Tag, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { colorPickers } from "@/app/constants";

const TicketDetailsDialog = () => {
  const dispatch = useAppDispatch();
  const { isOpen, ticketId } = useAppSelector(
    (state) => state.global.cardDetailDialog,
  );
  const activeBoardId = useAppSelector((state) => state.global.activeBoardId);

  const { data: ticket, isLoading: isTicketLoading } = useGetTicketQuery(
    ticketId ?? "",
    {
      skip: !ticketId,
    },
  );

  const { data: categories } = useGetCategoriesQuery(
    { boardId: activeBoardId ?? "" },
    {
      skip: !activeBoardId,
    },
  );

  const [updateTicket] = useUpdateTicketMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDescription(ticket.description ?? "");
    }
  }, [ticket]);

  const handleTitleUpdate = async () => {
    if (ticket && title !== ticket.title && title.trim()) {
      await updateTicket({ id: ticket.id, title: title.trim() });
    }
  };

  const handleDescriptionUpdate = async () => {
    if (ticket) {
      await updateTicket({ id: ticket.id, description: description.trim() });
      setIsEditingDescription(false);
    }
  };

  const handleColorUpdate = async (color: string | null) => {
    if (ticket) {
      const newColor = ticket.color === color ? null : color;
      await updateTicket({ id: ticket.id, color: newColor });
      setShowColorPicker(false);
    }
  };

  const handleCategoryUpdate = async (categoryId: string) => {
    if (ticket) {
      setIsCategoryDropdownOpen(false);
    }
  };

  const currentCategory = categories?.find((c) => c.id === ticket?.categoryId);

  const mockActivities = [
    {
      id: "1",
      user: "zasmine adrielle",
      initials: "ZA",
      action: "moved_list",
      detail: `from Doing to ${currentCategory?.title || "Todo"}`,
      time: "25 minutes ago",
    },
    {
      id: "2",
      user: "zasmine adrielle",
      initials: "ZA",
      action: "changed_title",
      detail: "from 'Design Auth' to 'Implement Frontend UI'",
      time: "2 hours ago",
    },
    {
      id: "3",
      user: "zasmine adrielle",
      initials: "ZA",
      action: "applied_color",
      detail: "blue",
      time: "4 hours ago",
    },
    {
      id: "4",
      user: "zasmine adrielle",
      initials: "ZA",
      action: "added_card",
      detail: "Doing",
      time: "11 hours ago",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => dispatch(closeCardDetail())}>
      <DialogContent className="sm:max-w-4xl bg-[#1d2125] border-white/10 text-[#b6c2cf] p-0 rounded-xl shadow-2xl">
        {isTicketLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-gray-500 font-bold text-sm italic">
              Loading card detail...
            </div>
          </div>
        ) : !ticket ? (
          <div className="p-12 text-center text-gray-400">Card not found.</div>
        ) : (
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#1d2125]">
              <div className="flex items-center gap-2 relative">
                <div
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer text-sm font-bold text-white"
                >
                  <span>{currentCategory?.title || "List"}</span>
                  <ChevronDown size={14} />
                </div>

                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#22272b] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 px-2 py-1">
                        Move card
                      </p>
                      {categories?.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryUpdate(cat.id)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-white/5",
                            cat.id === ticket.categoryId
                              ? "text-[#579dff] font-bold"
                              : "text-[#b6c2cf]",
                          )}
                        >
                          {cat.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1">
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex items-start">
                  <div className="flex-1">
                    <textarea
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleTitleUpdate}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleTitleUpdate();
                          (e.target as HTMLTextAreaElement).blur();
                        }
                      }}
                      rows={1}
                      className="w-full text-3xl font-extrabold border-2 focus:border-primary focus:outline-none focus:ring-0 p-1 text-white placeholder:text-gray-600 resize-none overflow-hidden min-h-10 rounded-md"
                      placeholder="Card title..."
                    />
                  </div>
                </div>
                {!ticket.color && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={cn(
                      "h-8 border-white/10 text-[#b6c2cf] hover:bg-white/10 text-xs gap-2 px-3",
                      showColorPicker
                        ? "bg-[#579dff]/20 border-[#579dff]/50"
                        : "bg-white/5",
                    )}
                  >
                    <Tag size={14} /> Labels
                  </Button>
                )}
                {(showColorPicker || ticket.color) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white px-1">
                      Labels
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 px-1">
                      {ticket.color && (
                        <div
                          className={cn(
                            "h-8 w-16 rounded-[3px] transition-all",
                            colorPickers.find(
                              (c) => c.name.toLowerCase() === ticket.color,
                            )?.color || "bg-gray-500",
                          )}
                          title={ticket.color}
                        />
                      )}
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="h-8 w-8 bg-white/10 hover:bg-white/20 text-[#b6c2cf] border-none"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>

                    {showColorPicker && (
                      <div className="flex flex-wrap gap-2 px-1 py-1 animate-in slide-in-from-top-1 duration-200">
                        {colorPickers.map((c) => (
                          <button
                            key={c.color}
                            onClick={() =>
                              handleColorUpdate(c.name.toLowerCase())
                            }
                            className={cn(
                              "h-8 w-12 rounded-[3px] transition-all hover:opacity-80 active:scale-95",
                              c.color,
                              ticket.color === c.name.toLowerCase() &&
                                "ring-2 ring-white ring-offset-2 ring-offset-[#1d2125]",
                            )}
                            title={c.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <AlignLeft className="text-[#9fadbc]" size={24} />
                    <h3 className="text-base font-bold text-white">
                      Description
                    </h3>
                  </div>
                  <div className="pl-10">
                    {isEditingDescription ? (
                      <div className="space-y-3">
                        <textarea
                          autoFocus
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full min-h-30 bg-[#22272b] p-3 text-sm rounded-lg border-2 border-transparent focus:border-primary outline-none resize-none"
                          placeholder="Add a more detailed description..."
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleDescriptionUpdate}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold h-9 px-3 rounded-md"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setIsEditingDescription(false)}
                            className="h-9 text-white font-bold hover:bg-white/5 hover:text-white/60"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingDescription(true)}
                        className={cn(
                          "p-3 rounded-md cursor-pointer min-h-12 text-sm",
                          description
                            ? "hover:bg-white/5"
                            : "bg-white/5 hover:bg-white/10 text-[#9fadbc]",
                        )}
                      >
                        {description || "Add a more detailed description..."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-80 bg-[#1d2125] border-l border-white/5 flex flex-col">
                <div className="p-4 flex items-center border-b border-white/5 gap-3">
                  <MessageSquare size={20} className="text-white" />
                  <h3 className="text-sm font-bold text-white">Activity</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                  <div className="space-y-4">
                    {mockActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 animate-in fade-in slide-in-from-right-2"
                        style={{ animationDuration: `${300 + index * 100}ms` }}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                          {activity.initials}
                        </div>
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-bold text-[#b6c2cf] mr-1">
                              {activity.user}
                            </span>
                            {activity.action === "applied_color" ? (
                              <span>
                                applied the{" "}
                                <span
                                  className="font-bold lowercase"
                                  style={{ color: "var(--primary)" }}
                                >
                                  {activity.detail}
                                </span>{" "}
                                label
                              </span>
                            ) : activity.action === "moved_list" ? (
                              <span>moved this card {activity.detail}</span>
                            ) : activity.action === "changed_title" ? (
                              <span>changed the title {activity.detail}</span>
                            ) : activity.action === "added_card" ? (
                              <span>added this card to {activity.detail}</span>
                            ) : (
                              <span>{activity.detail}</span>
                            )}
                          </p>
                          <p className="text-[#9fadbc]">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;
