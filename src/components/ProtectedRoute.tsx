/**
 * Route guard. Redirects unauthenticated users to /login. If `allowedRoles` is
 * provided and the current user's role is not among them, redirects to that
 * user's own home route instead.
 */
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_HOME } from '../config/navTypes';
import type { Role } from '../config/navTypes';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={ROLE_HOME[currentUser.role]} replace />;
  }

  return <>{children}</>;
}
