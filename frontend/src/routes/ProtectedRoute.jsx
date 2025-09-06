import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
