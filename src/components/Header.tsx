import { logout, type User } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/app/hooks";
import { Bell, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { openCreateBoardDialog } from "@/features/global/globalSlice";
import { Button } from "./ui/button";

type Props = { user: User | null };

const Header: React.FC<Props> = ({ user }) => {
    const dispatch = useAppDispatch();

  return (
    <header className="flex h-14 justify-between border-b bg-white px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="rounded-sm bg-primary p-1 text-white">
            <LayoutDashboard size={18} />
          </div>
          <h5 className="font-bold text-primary text-xl">Todo Board</h5>
        </div>
        <Button
          onClick={() => dispatch(openCreateBoardDialog())}
          variant="secondary"
          size="lg"
          className="flex items-center gap-2 rounded-md bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/20 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2} />
          <span>Create</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-primary transition-colors cursor-pointer">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-white shadow-sm text-xs">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.name}
          </div>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-2"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
