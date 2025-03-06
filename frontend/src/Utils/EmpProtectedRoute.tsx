import { Navigate, Outlet } from "react-router-dom";

const EmpProtectedRoute = () => {
  const empToken = localStorage.getItem("empToken");

  if (!empToken) {
    return <Navigate to="/employee/login" replace />;
  }

  return <Outlet />;
};

export default EmpProtectedRoute;
