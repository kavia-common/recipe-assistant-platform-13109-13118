import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute guards routes that require authentication.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <Favorites />
 *   </ProtectedRoute>
 *
 * If unauthenticated, it redirects to /login and preserves the intended path in state.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
