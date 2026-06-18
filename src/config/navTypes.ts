/**
 * Shared route & navigation contract for the I-ON (EZAxis) app shell.
 *
 * Feature agents: import these types in your `registry.tsx` files. Do NOT
 * redefine Role / AppRoute / NavItem locally — keep one source of truth.
 */
import type { ReactNode } from 'react';

/** The four web roles in scope (MSP Technician is mobile-only and excluded). */
export type Role = 'super_admin' | 'tenant' | 'building_manager' | 'msp_supervisor';

/** A nested route registered under the protected <DashboardLayout> parent. */
export interface AppRoute {
  /** Path relative to the app root, e.g. "admin/dashboard". No leading slash. */
  path: string;
  element: ReactNode;
  /** Mark as an index route (rendered at the parent path). */
  index?: boolean;
}

/** A sidebar / navigation entry, scoped to one or more roles. */
export interface NavItem {
  label: string;
  /** Absolute path the item navigates to, e.g. "/admin/dashboard". */
  path: string;
  icon: ReactNode;
  roles: Role[];
  /** Optional i18n key; falls back to `label` if missing. */
  i18nKey?: string;
}

/** Human-readable labels for each role (badges, menus). */
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  tenant: 'Tenant',
  building_manager: 'Building Manager',
  msp_supervisor: 'MSP Supervisor',
};

/** Home route each role lands on after login. */
export const ROLE_HOME: Record<Role, string> = {
  super_admin: '/admin/dashboard',
  building_manager: '/bm/dashboard',
  msp_supervisor: '/msp/dashboard',
  tenant: '/tenant/service-request',
};
