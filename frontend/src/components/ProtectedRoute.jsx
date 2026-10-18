import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        Loading workspace…
      </div>
    );
  return user ? (
    children
  ) : (
    <Navigate to="/admin/login" replace state={{ from: location }} />
  );
}
