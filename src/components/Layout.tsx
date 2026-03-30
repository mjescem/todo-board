import { useAppSelector } from "@/app/hooks";
import Header from "./Header";
import { Outlet } from "react-router-dom";

function Layout(){
 const user = useAppSelector((state) => state.auth?.user);

  return (
    <main className="flex h-screen flex-col">
        <Header user={user} />
        <Outlet />
    </main>
  );
}

export default Layout