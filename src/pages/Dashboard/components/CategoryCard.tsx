import { Plus, Trash2, X } from "lucide-react";
import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useReorderCategoryMutation,
  type Category,
} from "@/features/categories/categoriesApi";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useReorderTicketMutation,
  type Ticket,
} from "@/features/tickets/ticketsApi";
import TicketCard from "./TicketCard";

let globalDraggedCategoryHeight = 100;

type Props = {
  category: Category;
};

const CategoryCard: React.FC<Props> = ({ category }) => {
  const { data: tickets = [] } = useGetTicketsQuery({
    categoryId: category.id,
  });
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [reorderTicket] = useReorderTicketMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(category.title);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [categoryDropIndicator, setCategoryDropIndicator] = useState<
    "left" | "right" | null
  >(null);

  const [reorderCategory] = useReorderCategoryMutation();

  const addCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isAddingCard &&
        addCardRef.current &&
        !addCardRef.current.contains(event.target as Node)
      ) {
        setIsAddingCard(false);
        setNewCardTitle("");
      }
    };

    if (isAddingCard) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingCard]);

  const handleUpdateTitle = async () => {
    const trimmedTitle = titleValue.trim();

    if (!trimmedTitle || trimmedTitle === category.title) {
      setTitleValue(category.title);
      setIsEditing(false);
      return;
    }

    try {
      await updateCategory({
        id: category.id,
        title: trimmedTitle,
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update category:", error);
      setTitleValue(category.title);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id).unwrap();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    try {
      await createTicket({
        categoryId: category.id,
        title: newCardTitle.trim(),
      }).unwrap();
      setNewCardTitle("");
      setIsAddingCard(false);
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddCard();
    } else if (e.key === "Escape") {
      setIsAddingCard(false);
      setNewCardTitle("");
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    globalDraggedCategoryHeight = (e.currentTarget as HTMLElement).offsetHeight;
    e.dataTransfer.setData("category", JSON.stringify(category));
    e.dataTransfer.effectAllowed = "move";

    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = "0";
      target.style.width = "0px";
      target.style.minWidth = "0px";
      target.style.padding = "0px";
      target.style.margin = "0px";
      target.style.border = "0px";
      target.style.overflow = "hidden";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    target.style.width = "";
    target.style.minWidth = "";
    target.style.padding = "";
    target.style.margin = "";
    target.style.border = "";
    target.style.overflow = "";
    setCategoryDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("category")) {
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const isRightHalf = e.clientX - rect.left > rect.width / 2;
      setCategoryDropIndicator(isRightHalf ? "right" : "left");
    } else {
      if (tickets.length === 0) {
        setIsDragOver(true);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node | null;
    if (!currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
      setCategoryDropIndicator(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const indicator = categoryDropIndicator;
    setCategoryDropIndicator(null);

    if (e.dataTransfer.types.includes("category")) {
      const draggedCategoryData = e.dataTransfer.getData("category");
      if (!draggedCategoryData) return;
      const draggedCategory: Category = JSON.parse(draggedCategoryData);
      if (draggedCategory.id === category.id) return;

      const newOrder =
        indicator === "right" ? category.order + 1 : category.order;

      try {
        await reorderCategory({
          id: draggedCategory.id,
          boardId: draggedCategory.boardId,
          newOrder,
        }).unwrap();
      } catch (error) {
        console.error("Failed to reorder category:", error);
      }
      return;
    }

    if (tickets.length > 0) return;

    const draggedTicketData = e.dataTransfer.getData("ticket");
    if (!draggedTicketData) return;

    const draggedTicket: Ticket = JSON.parse(draggedTicketData);
    if (draggedTicket.categoryId === category.id) return;

    try {
      await reorderTicket({
        id: draggedTicket.id,
        ticket: draggedTicket,
        sourceCategoryId: draggedTicket.categoryId,
        destinationCategoryId: category.id,
        newOrder: 0,
      }).unwrap();
    } catch (error) {
      console.error("Failed to move ticket to empty category:", error);
    }
  };

  const CategoryPlaceholder = () => (
    <div
      className="min-w-68 rounded-xl bg-white/10 transition-all duration-200"
      style={{ height: `${globalDraggedCategoryHeight}px` }}
    />
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex h-full ${categoryDropIndicator ? "gap-4" : ""}`}
    >
      {categoryDropIndicator === "left" && <CategoryPlaceholder />}
      <section
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="flex flex-col min-w-68 rounded-xl bg-black pb-2 transition-all duration-200 h-fit max-h-full"
      >
        <div className="flex items-center px-3 py-3 group cursor-pointer">
          <div className="flex-1">
            {isEditing ? (
              <Input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateTitle();
                  if (e.key === "Escape") {
                    setTitleValue(category.title);
                    setIsEditing(false);
                  }
                }}
                className="h-7 px-1 text-sm font-bold text-white bg-white/10 border-none"
              />
            ) : (
              <h3
                onClick={() => setIsEditing(true)}
                className="text-sm font-bold text-white"
              >
                {category.title}
              </h3>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsConfirmDialogOpen(true)}
            className="h-6 w-6 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </Button>
        </div>
        <div className="flex-1 px-2">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          {isDragOver && tickets.length === 0 && (
            <div className="w-full min-h-15 bg-white/10 rounded-lg pointer-events-none transition-all duration-200" />
          )}
        </div>
        <div className="px-2 pt-2">
          {isAddingCard ? (
            <div
              ref={addCardRef}
              className="flex flex-col gap-2 rounded-xl bg-[#22272b] p-3 shadow-lg border border-white/5"
            >
              <textarea
                autoFocus
                placeholder="Enter a title or paste a link"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={handleCardKeyDown}
                className="w-full min-h-16 p-3 text-sm font-medium text-white bg-[#22272b] rounded-xl border-2 border-transparent focus:border-primary outline-none shadow-xl resize-none placeholder:text-gray-500"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddCard}
                  disabled={isCreating || !newCardTitle.trim()}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold h-9 px-3 rounded-md"
                >
                  {isCreating ? "Adding..." : "Add card"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsAddingCard(false);
                    setNewCardTitle("");
                  }}
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setIsAddingCard(true)}
              className="w-full justify-start gap-2 h-9 px-2 text-sm font-medium text-white hover:text-white hover:bg-white/20"
            >
              <Plus size={16} />
              <span>Add a card</span>
            </Button>
          )}
        </div>
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          title="Delete this list?"
          description={`Are you sure you want to delete "${category.title}"? This will permanently remove all tickets within this list.`}
          confirmText="Delete"
          intent="danger"
          confirmAction={handleDelete}
        />
      </section>
      {categoryDropIndicator === "right" && <CategoryPlaceholder />}
    </div>
  );
};

export default CategoryCard;
