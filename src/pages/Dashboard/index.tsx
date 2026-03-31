import { ChevronDown, Plus } from "lucide-react";
import CategoryCard from "./components/CategoryCard";
import {
  useGetBoardsQuery,
  useUpdateBoardMutation,
} from "@/features/boards/boardsApi";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  openBoardSelectorDialog,
  openCreateBoardDialog,
  setActiveBoard,
} from "@/features/global/globalSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "c1", title: "To Do" },
  { id: "c2", title: "Doing" },
  { id: "c3", title: "Done" },
  { id: "c4", title: "test" },
];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { data: boards = [], isLoading: isBoardsLoading } = useGetBoardsQuery();
  const { activeBoardId } = useAppSelector((state) => state.global);
  const [updateBoard] = useUpdateBoardMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId),
    [boards, activeBoardId],
  );

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdateTitle();
    } else if (e.key === "Escape") {
      setTitleValue(activeBoard?.title || "");
      setIsEditing(false);
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
          className="flex items-center gap-2 rounded-xl"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Create Board</span>
        </Button>
      </div>
      <div className="flex h-full gap-4 items-start">
        {categories.map((category) => (
          <CategoryCard category={category} />
        ))}
        <button className="flex min-w-60 items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 text-white">
          <Plus size={16} />
          <span className="text-sm font-medium">Add another list</span>
        </button>
      </div>
    </section>
  );
}
