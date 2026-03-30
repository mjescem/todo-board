import type { User } from "@/features/auth/authSlice";
import { Bell, LayoutDashboard, LogOut } from "lucide-react";

type Props = { user: User | null };

const Header: React.FC<Props> = ({ user }) => {
  return (
    <header className="flex h-14 justify-between border-b bg-white px-6">
        <div className="flex items-center gap-3">
            <div className="rounded-sm bg-primary p-1 text-white">
                <LayoutDashboard size={18} />
            </div>
            <h5 className="font-bold text-primary text-xl">Todo Board</h5>
        </div>
        <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-primary cursor-pointer">
                <Bell size={20} />
            </button>
            <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary font-semibold text-white">
                    {user?.name?.charAt(0)}
                </div>
                <div className="text-sm text-gray-800">
                    {user?.name}
                </div>
            </div>
            <button className="text-gray-400 hover:text-red-600 cursor-pointer">
                <LogOut size={20} />
            </button>
        </div>
    </header>
  );
};

export default Header;
