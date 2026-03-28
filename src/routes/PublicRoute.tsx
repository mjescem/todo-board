import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

const PublicRoute = () => {
    const user = useAppSelector((state) => state.auth.user)

    if(user){
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default PublicRoute