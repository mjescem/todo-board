import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Header from "./Header";
import { Outlet, useNavigate } from "react-router-dom";
import CreateBoardDialog, { type BoardForm } from "./dialog/CreateBoardDialog";
import { closeCreateBoardDialog } from "@/features/global/globalSlice";
import { useCreateBoardMutation } from "@/features/boards/boardsApi";
import { lazy } from "react";

const BoardSelectorDialog = lazy(() => import("./dialog/BoardSelectorDialog"));
const TicketDetailsDialog = lazy(() => import("./dialog/TicketDetailsDialog"));

function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth?.user);
  const { isOpen } = useAppSelector((state) => state.global.createBoardDialog);
  const [createBoard, { isLoading }] = useCreateBoardMutation();

  const handleCreateBoard = async (data: BoardForm) => {
    try {
      const newBoard = await createBoard(data).unwrap();
      navigate(`/boards/${newBoard.id}`);
      dispatch(closeCreateBoardDialog());
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  return (
    <main className="flex h-screen flex-col">
      <Header user={user} />
      <Outlet />
      <CreateBoardDialog
        isOpen={isOpen}
        isLoading={isLoading}
        onClose={() => dispatch(closeCreateBoardDialog())}
        onCreate={handleCreateBoard}
      />
      <BoardSelectorDialog />
      <TicketDetailsDialog />
    </main>
  );
}

export default Layout;
