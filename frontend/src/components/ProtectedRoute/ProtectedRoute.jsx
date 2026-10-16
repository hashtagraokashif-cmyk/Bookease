import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Sends visitors who aren't logged in to /login, remembering where they were
 * going (including any booking details) so they come straight back after.
 */
function ProtectedRoute({ children, role }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking && !user) {
    return (
      <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#64748b" }}>
        Loading...
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
