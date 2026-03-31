import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import CreateBoardDialog, { type BoardForm } from "./dialog/CreateBoardDialog";
import { closeCreateBoardDialog, setActiveBoard } from "@/features/global/globalSlice";
import { useCreateBoardMutation } from "@/features/boards/boardsApi";
import BoardSelectorModal from "./dialog/BoardSelectorDialog";

function Layout(){
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const { isOpen } = useAppSelector((state) => state.global.createBoardDialog);
  const [createBoard, { isLoading }] = useCreateBoardMutation();

  const handleCreateBoard = async (data: BoardForm) => {
     try {
       const newBoard = await createBoard(data).unwrap();
       dispatch(setActiveBoard(newBoard.id));
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
      <BoardSelectorModal />
    </main>
  );
}

export default Layout