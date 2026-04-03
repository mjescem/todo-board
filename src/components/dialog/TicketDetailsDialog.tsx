import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { closeCardDetail } from "@/features/global/globalSlice";
import {
  useGetTicketQuery,
  useUpdateTicketMutation,
  useGetTicketActivitiesQuery,
  useReorderTicketMutation,
} from "@/features/tickets/ticketsApi";
import { useGetCategoriesQuery } from "@/features/categories/categoriesApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlignLeft,
  MessageSquare,
  ChevronDown,
  Tag,
  Plus,
  Clock,
  X,
} from "lucide-react";
import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { colorPickers } from "@/app/constants";
import { formatRelativeTime } from "@/lib/utils/formatRelativeTime";
import { format } from "date-fns";
import DueDatePicker from "../DueDatePicker";

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
  const [reorderTicket] = useReorderTicketMutation();

  const { data: activities = [], isLoading: isActivitiesLoading } =
    useGetTicketActivitiesQuery(ticketId ?? "", {
      skip: !ticketId,
    });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      const originalDescription = ticket.description ?? "";
      setInitialDescription(originalDescription);

      const savedDraft = localStorage.getItem(`draft_desc_${ticket.id}`);
      if (savedDraft && savedDraft !== originalDescription) {
        setDescription(savedDraft);
        setHasUnsavedChanges(true);
        setIsEditingDescription(false);
      } else {
        setDescription(originalDescription);
        setHasUnsavedChanges(false);
        setIsEditingDescription(false);
        localStorage.removeItem(`draft_desc_${ticket.id}`);
      }
    }
  }, [ticket]);

  const handleTitleUpdate = async () => {
    if (ticket && title !== ticket.title && title.trim()) {
      await updateTicket({ id: ticket.id, title: title.trim() });
    }
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setDescription(newVal);

    const isDifferent = newVal !== initialDescription;
    setHasUnsavedChanges(isDifferent);

    if (ticket) {
      if (isDifferent) {
        localStorage.setItem(`draft_desc_${ticket.id}`, newVal);
      } else {
        localStorage.removeItem(`draft_desc_${ticket.id}`);
      }
    }
  };

  const handleDescriptionSave = async () => {
    if (ticket) {
      await updateTicket({ id: ticket.id, description: description.trim() });
      localStorage.removeItem(`draft_desc_${ticket.id}`);
      setInitialDescription(description.trim());
      setHasUnsavedChanges(false);
      setIsEditingDescription(false);
    }
  };

  const handleDescriptionDiscard = () => {
    if (ticket) {
      setDescription(initialDescription);
      setHasUnsavedChanges(false);
      setIsEditingDescription(false);
      localStorage.removeItem(`draft_desc_${ticket.id}`);
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
    if (ticket && categoryId !== ticket.categoryId) {
      await reorderTicket({
        id: ticket.id,
        ticket: ticket,
        sourceCategoryId: ticket.categoryId,
        destinationCategoryId: categoryId,
        newOrder: 0,
      });
    }
  };

  const currentCategory = categories?.find((c) => c.id === ticket?.categoryId);

  const getActivityLabel = (action: string, meta: Record<string, string>) => {
    const renderColorText = (colorName: string | null) => {
      if (!colorName) return "no color";
      const picker = colorPickers.find(
        (c) => c.name.toLowerCase() === colorName.toLowerCase(),
      );
      if (!picker) return colorName;

      const textColorClass = picker.color.replace("bg-", "text-");
      return (
        <span className={cn("font-bold lowercase", textColorClass)}>
          {colorName}
        </span>
      );
    };

    switch (action) {
      case "created":
        return `added this card to ${meta.categoryName ?? "a list"}`;
      case "title_changed":
        return (
          <span>
            changed the title from{" "}
            <span className="font-bold italic">"{meta.from}"</span> to{" "}
            <span className="font-bold italic">"{meta.to}"</span>
          </span>
        );
      case "description_changed":
        return "updated the description";
      case "color_changed":
        if (!meta.from && meta.to) {
          return <span>applied the {renderColorText(meta.to)} label</span>;
        }
        if (meta.from && !meta.to) {
          return <span>removed the {renderColorText(meta.from)} label</span>;
        }
        return (
          <span>
            changed the label from {renderColorText(meta.from)} to{" "}
            {renderColorText(meta.to)}
          </span>
        );
      case "category_moved":
        return (
          <span>
            moved this card from <span className="font-bold">{meta.from}</span>{" "}
            to <span className="font-bold">{meta.to}</span>
          </span>
        );
      case "status_changed":
        return (
          <span>
            marked this card as <span className="font-bold">{meta.to}</span>
          </span>
        );
      case "expiry_date_changed":
        if (!meta.from && meta.to) {
          return (
            <span>
              set the due date to{" "}
              <span className="font-bold">
                {format(new Date(meta.to), "MMM d 'at' h:mm a")}
              </span>
            </span>
          );
        }
        if (meta.from && !meta.to) {
          return <span>removed the due date</span>;
        }
        return (
          <span>
            changed the due date to{" "}
            <span className="font-bold">
              {format(new Date(meta.to), "MMM d 'at' h:mm a")}
            </span>
          </span>
        );
      default:
        return action;
    }
  };

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer text-sm font-bold text-white outline-none">
                      <span>{currentCategory?.title || "List"}</span>
                      <ChevronDown size={14} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-[#22272b] border-white/10 text-[#b6c2cf]">
                    <DropdownMenuLabel className="text-[10px] font-bold text-gray-500 px-2 py-1">
                      Move card
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    {categories?.map((cat) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => handleCategoryUpdate(cat.id)}
                        className={cn(
                          "cursor-pointer focus:bg-white/5 focus:text-white",
                          cat.id === ticket.categoryId &&
                            "text-[#579dff] font-bold",
                        )}
                      >
                        {cat.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-1">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                      className="w-full text-3xl font-extrabold border-0 focus:border-2 focus:border-primary focus:outline-none focus:ring-0 p-1 text-white placeholder:text-gray-600 resize-none overflow-hidden min-h-10 rounded-md"
                      placeholder="Card title..."
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!ticket.color && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className={cn(
                        "h-8 border-white/10 text-[#b6c2cf] hover:text-[#b6c2cf] hover:bg-white/10 text-xs gap-2 px-3",
                        showColorPicker
                          ? "bg-[#579dff]/20 border-[#579dff]/50"
                          : "bg-white/5",
                      )}
                    >
                      <Tag size={14} /> Labels
                    </Button>
                  )}
                  {!ticket.expiryDate && (
                    <Popover
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-white/10 text-[#b6c2cf] hover:text-[#b6c2cf] bg-white/5 hover:bg-white/10 text-xs gap-2 px-3 data-[state=open]:bg-[#579dff]/20 data-[state=open]:border-[#579dff]/50 data-[state=open]:text-[#b6c2cf]"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Dates
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80 p-0 z-50 bg-[#282d33] border-white/10 text-[#b6c2cf]"
                        align="start"
                      >
                        <DueDatePicker
                          initialDate={ticket.expiryDate ?? undefined}
                          onSave={async (dateString) => {
                            await updateTicket({
                              id: ticket.id,
                              expiryDate: dateString,
                            });
                            setIsPopoverOpen(false);
                          }}
                          onRemove={async () => {
                            await updateTicket({
                              id: ticket.id,
                              expiryDate: null,
                            });
                            setIsPopoverOpen(false);
                          }}
                          onClose={() => setIsPopoverOpen(false)}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                {(showColorPicker || ticket.color || ticket.expiryDate) && (
                  <div className="flex flex-wrap gap-2 px-1">
                    {(showColorPicker || ticket.color) && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-[#9fadbc]">
                          Labels
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                          {ticket.color && (
                            <div
                              className={cn(
                                "h-8 w-14 rounded-[3px] transition-all",
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
                            className="h-8 w-8 bg-white/5 hover:bg-white/10 text-[#b6c2cf] border-none rounded-[3px]"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                    {ticket.expiryDate && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-[#9fadbc]">
                          Due Date
                        </h4>
                        <div className="flex items-center gap-2 bg-white/5 h-8 px-3 rounded-[3px] border border-white/5">
                          <span className="text-xs font-medium text-white">
                            {format(
                              new Date(ticket.expiryDate),
                              "MMM d 'at' h:mm a",
                            )}
                          </span>
                          <button
                            onClick={() =>
                              updateTicket({ id: ticket.id, expiryDate: null })
                            }
                            className="ml-1 text-[#9fadbc] hover:text-white transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showColorPicker && (
                  <div className="flex flex-wrap gap-2 px-1 py-2 animate-in slide-in-from-top-1 duration-200 border-t border-white/5 mt-1">
                    {colorPickers.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => handleColorUpdate(c.name.toLowerCase())}
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <AlignLeft className="text-[#9fadbc]" size={24} />
                      <h3 className="text-base font-bold text-white">
                        Description
                      </h3>
                    </div>
                    {hasUnsavedChanges && (
                      <span className="text-[10px] font-bold text-white border border-orange-400/50 rounded-[3px] px-2 py-0.5 uppercase">
                        Unsaved Changes
                      </span>
                    )}
                  </div>
                  <div className="pl-10">
                    {isEditingDescription ? (
                      <div className="space-y-3">
                        <textarea
                          autoFocus
                          value={description}
                          onChange={handleDescriptionChange}
                          className="w-full min-h-30 bg-[#22272b] p-3 text-sm rounded-lg border-2 border-transparent focus:border-primary outline-none resize-none"
                          placeholder="Add a more detailed description..."
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleDescriptionSave}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold h-9 rounded-md"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (hasUnsavedChanges) {
                                handleDescriptionDiscard();
                              } else {
                                setIsEditingDescription(false);
                              }
                            }}
                            className="h-9 text-white font-bold hover:bg-white/5 hover:text-white/60"
                          >
                            {hasUnsavedChanges ? "Discard changes" : "Cancel"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingDescription(true)}
                        className={cn(
                          "p-3 rounded-md cursor-pointer min-h-12 text-sm",
                          initialDescription
                            ? "hover:bg-white/5"
                            : "bg-white/5 hover:bg-white/10 text-[#9fadbc]",
                        )}
                      >
                        {initialDescription ||
                          "Add a more detailed description..."}
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
                  {isActivitiesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="h-8 w-8 rounded-full bg-white/10 shrink-0" />
                          <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-white/10 rounded w-3/4" />
                            <div className="h-3 bg-white/10 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
                      <MessageSquare size={28} className="text-white/20" />
                      <p className="text-xs text-white/30">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className="flex gap-3 animate-in fade-in slide-in-from-right-2"
                          style={{
                            animationDuration: `${300 + index * 100}ms`,
                          }}
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                            {activity.user.initials}
                          </div>
                          <div className="text-xs space-y-1">
                            <p>
                              <span className="font-bold text-[#b6c2cf] mr-1">
                                {activity.user.name}
                              </span>
                              <span>
                                {getActivityLabel(
                                  activity.action,
                                  activity.meta,
                                )}
                              </span>
                            </p>
                            <p className="text-[#9fadbc]">
                              {formatRelativeTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
