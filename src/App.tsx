/**
 * App routing. Public routes (landing, auth, and the public Tenant service-
 * request portal) sit alongside a single protected <DashboardLayout> parent
 * that renders every section's nested routes (merged in config/routes.tsx).
 * Feature agents register routes via their section registry; this file never
 * needs editing to add a screen.
 *
 * The Tenant Portal is PUBLIC (no auth) — `/service-request`. There is no
 * self-registration (`/signup` removed) and no SSO.
 */
import { Navigate, Route, Routes } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import PublicServiceRequest from './pages/PublicServiceRequest';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { allAppRoutes } from './config/routes';
import type { Role } from './config/navTypes';

/**
 * Map a route path's section prefix to the role(s) allowed to access it. Used to
 * enforce per-portal RBAC on direct URL access (a logged-in role cannot view
 * another portal's screens), complementing the sidebar's role-scoped nav.
 */
function rolesForPath(path: string | undefined): Role[] | undefined {
  if (!path) return undefined;
  if (path.startsWith('admin/')) return ['super_admin'];
  if (path.startsWith('bm/')) return ['building_manager'];
  if (path.startsWith('msp/')) return ['msp_supervisor'];
  return undefined;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Public Tenant service-request portal (no auth). Old authenticated
          tenant paths redirect here. */}
      <Route path="/service-request" element={<PublicServiceRequest />} />
      <Route path="/tenant/service-request" element={<Navigate to="/service-request" replace />} />
      <Route path="/tenant/*" element={<Navigate to="/service-request" replace />} />

      {/* Protected app shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {allAppRoutes.map((r) => {
          const allowedRoles = rolesForPath(r.path);
          const guarded = allowedRoles ? (
            <ProtectedRoute allowedRoles={allowedRoles}>{r.element}</ProtectedRoute>
          ) : (
            r.element
          );
          return r.index ? (
            <Route key={r.path || 'index'} index element={guarded} />
          ) : (
            <Route key={r.path} path={r.path} element={guarded} />
          );
        })}
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
