import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  closeBoardSelectorDialog,
  openCreateBoardDialog,
  setActiveBoard,
} from "@/features/global/globalSlice";
import { useGetBoardsQuery } from "@/features/boards/boardsApi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const BoardSelectorModal = () => {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector(
    (state) => state.global.boardSelectorDialog,
  );
  const { activeBoardId } = useAppSelector((state) => state.global);
  const { data: boards, isLoading } = useGetBoardsQuery();

  const handleClose = () => {
    dispatch(closeBoardSelectorDialog());
  };

  const handleSelectBoard = (id: string) => {
    dispatch(setActiveBoard(id));
    handleClose();
  };

  const handleCreateNew = () => {
    dispatch(openCreateBoardDialog());
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl w-full p-0 gap-0 rounded-3xl">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-center text-base font-semibold text-black">
            Your boards
          </DialogTitle>
        </DialogHeader>
        <div className="p-8 max-h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-sm font-bold animate-pulse">
                  Loading boards...
                </p>
              </div>
            ) : boards?.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center border-2 border-dashed border-border rounded-2xl bg-muted/10">
                <p className="font-medium mb-4">
                  You don't have any boards yet.
                </p>
                <Button
                  size="lg"
                  onClick={handleCreateNew}
                  className="gap-2 rounded-lg font-semibold hover:bg-primary/60"
                >
                  <Plus size={16} strokeWidth={2} />
                  <span>Create first board</span>
                </Button>
              </div>
            ) : (
              <>
                {boards?.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => handleSelectBoard(board.id)}
                    className={`group relative h-28 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-2 shadow-sm flex flex-col justify-between overflow-hidden ${
                      activeBoardId === board.id
                        ? "border-primary bg-primary text-white shadow-primary/20"
                        : "border-transparent bg-muted/40 hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-base">
                        {board.title}
                      </h3>
                      {activeBoardId === board.id && (
                        <div className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleCreateNew}
                  className="flex h-28 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white text-muted-foreground transition-all hover:bg-muted/20 hover:text-primary active:scale-[0.98] group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                      <Plus size={20} strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold tracking-tight">
                      Create new board
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardSelectorModal;
