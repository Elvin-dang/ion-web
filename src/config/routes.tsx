/**
 * SINGLE SOURCE OF TRUTH for routes + navigation.
 *
 * This file merges the four per-section registries (filled by feature agents)
 * into one set of nested routes and one nav list. Both the Router (App.tsx) and
 * the Sidebar (DashboardLayout) consume the exports here — feature agents only
 * ever touch their own `features/<section>/registry.tsx`, never this file.
 */
import type { AppRoute, NavItem, Role } from './navTypes';

import { adminRoutes, adminNav } from '../features/admin/registry';
import { buildingManagerRoutes, buildingManagerNav } from '../features/buildingManager/registry';
import { mspSupervisorRoutes, mspSupervisorNav } from '../features/mspSupervisor/registry';

// NOTE: The Tenant portal is a PUBLIC, unauthenticated flow (see App.tsx,
// `/service-request`). It is intentionally NOT part of the protected app shell,
// so it contributes no protected routes and no sidebar nav.

/** All protected nested routes from every section, merged. */
export const allAppRoutes: AppRoute[] = [
  ...adminRoutes,
  ...buildingManagerRoutes,
  ...mspSupervisorRoutes,
];

/** All sidebar nav items from every section, merged. */
export const allNavItems: NavItem[] = [
  ...adminNav,
  ...buildingManagerNav,
  ...mspSupervisorNav,
];

/** Nav items visible to a given role. */
export function navForRole(role: Role | undefined | null): NavItem[] {
  if (!role) return [];
  return allNavItems.filter((item) => item.roles.includes(role));
}
