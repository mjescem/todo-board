import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

const ProtectedRoute = () => {
  const user = useAppSelector((state) => state.auth.user);
const token = useAppSelector((state) => state.auth.token)

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute
