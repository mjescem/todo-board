import { ChevronDown, Plus, X } from "lucide-react";
import CategoryCard from "./components/CategoryCard";
import {
  useGetBoardsQuery,
  useUpdateBoardMutation,
} from "@/features/boards/boardsApi";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  openBoardSelectorDialog,
  openCreateBoardDialog,
  setActiveBoard,
} from "@/features/global/globalSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
} from "@/features/categories/categoriesApi";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { data: boards = [], isLoading: isBoardsLoading } = useGetBoardsQuery();
  const { activeBoardId } = useAppSelector((state) => state.global);
  const [updateBoard] = useUpdateBoardMutation();

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery(
      { boardId: activeBoardId! }
    );

  const [createCategory, { isLoading: isCreatingCategory }] =
    useCreateCategoryMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const isLoading = isBoardsLoading || (activeBoardId && isCategoriesLoading);
  const addListRef = useRef<HTMLDivElement>(null);

  const activeBoard = boards.find((b) => b.id === activeBoardId)

  const handleUpdateTitle = async () => {
    if (
      !activeBoard ||
      !titleValue.trim() ||
      titleValue === activeBoard.title
    ) {
      setIsEditing(false);
      return;
    }

    try {
      await updateBoard({
        id: activeBoard.id,
        title: titleValue.trim(),
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update board title:", error);
      setTitleValue(activeBoard.title);
      setIsEditing(false);
    }
  };

  const handleAddList = async () => {
    if (!activeBoardId || !newListTitle.trim()) return;

    try {
      await createCategory({
        boardId: activeBoardId,
        title: newListTitle.trim(),
      }).unwrap();
      setNewListTitle("");
      setIsAddingList(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdateTitle();
    } else if (e.key === "Escape") {
      setTitleValue(activeBoard?.title || "");
      setIsEditing(false);
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddList();
    } else if (e.key === "Escape") {
      setIsAddingList(false);
      setNewListTitle("");
    }
  };

  useEffect(() => {
    if (!isBoardsLoading && !activeBoardId) {
      if (boards.length > 0) {
        dispatch(setActiveBoard(boards[0].id));
      } else {
        dispatch(openBoardSelectorDialog());
      }
    }
  }, [activeBoardId, boards, isBoardsLoading, dispatch]);

  useEffect(() => {
    if (activeBoard) {
      setTitleValue(activeBoard.title);
    }
  }, [activeBoard]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isAddingList &&
          addListRef.current &&
          !addListRef.current.contains(event.target as Node)
        ) {
          setIsAddingList(false);
          setNewListTitle("");
        }
      };
  
      if (isAddingList) {
        document.addEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isAddingList]);

  return (
    <section className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-6">
      <div className="flex items-center justify-between pb-4">
        <div className="flex gap-1.5 group">
          {isEditing ? (
            <Input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={handleKeyDown}
              className="h-9 px-2 text-xl font-black text-white bg-black/20 border-white/30 w-50"
            />
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="text-xl font-black text-white cursor-text hover:bg-white/10 px-2 rounded-md"
            >
              {activeBoard?.title || "No Board Selected"}
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(openBoardSelectorDialog())}
            className="h-8 w-8 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
          >
            <ChevronDown size={18} />
          </Button>
        </div>

        <Button
          size="lg"
          onClick={() => dispatch(openCreateBoardDialog())}
          className="flex items-center gap-2 rounded-lg"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Create Board</span>
        </Button>
      </div>
      <div className="flex h-full gap-4 items-start">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadowed-md" />
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </>
        )}
        {isAddingList ? (
          <div
            ref={addListRef}
            className="flex flex-col min-w-72 bg-black rounded-xl p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <Input
              autoFocus
              placeholder="Enter list name..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyDown={handleListKeyDown}
              className="bg-[#22272b] border-2 border-primary/40 focus-visible:ring-0 text-white h-10 mb-3"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddList}
                disabled={isCreatingCategory || !newListTitle.trim()}
                className="bg-primary hover:bg-primary/90 text-white font-semibold h-9 px-3 rounded-md"
              >
                {isCreatingCategory ? "Adding..." : "Add list"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsAddingList(false);
                  setNewListTitle("");
                }}
                className="h-8 w-8 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X size={20} strokeWidth={3} />
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingList(true)}
            className="flex min-w-60 items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 text-white"
          >
            <Plus size={16} />
            {categories.length === 0 ? (
              <span className="text-sm font-medium">Add a list</span>
            ) : (
              <span className="text-sm font-medium">Add another list</span>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
