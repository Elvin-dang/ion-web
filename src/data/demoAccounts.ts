/**
 * Demo accounts — one per web role. NO MSP Technician (mobile-only, excluded).
 * Used by the Login / SignUp quick-access cards and as the default fallback
 * login when an arbitrary email/password is entered.
 */
import type { Role } from '../config/navTypes';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Avatar image URL (ui-avatars renders initials on a tinted background). */
  avatar: string;
  /** Short blurb describing what this account can do (shown on cards). */
  description: string;
}

function avatarUrl(name: string): string {
  const seed = encodeURIComponent(name);
  // Teal (0F766E) background, white text — matches brand primary.
  return `https://ui-avatars.com/api/?name=${seed}&background=0F766E&color=fff&bold=true&format=svg`;
}

export const demoAccounts: DemoUser[] = [
  {
    id: 'u-super-admin',
    name: 'Avery Sterling',
    email: 'admin@ezaxis.io',
    role: 'super_admin',
    avatar: avatarUrl('Avery Sterling'),
    description: 'Platform-wide config, buildings, users, assets & reporting.',
  },
  {
    id: 'u-building-manager',
    name: 'Marcus Delgado',
    email: 'manager@ezaxis.io',
    role: 'building_manager',
    avatar: avatarUrl('Marcus Delgado'),
    description: 'Per-building approvals, assets, inventory & work-order sign-off.',
  },
  {
    id: 'u-msp-supervisor',
    name: 'Priya Raman',
    email: 'supervisor@ezaxis.io',
    role: 'msp_supervisor',
    avatar: avatarUrl('Priya Raman'),
    description: 'Work-order creation, technician assignment & spare-part requests.',
  },
  // No Tenant demo account: the Tenant portal is public/unauthenticated
  // (`/service-request`) and has no login.
];

/** The account used when a user logs in with arbitrary credentials. */
export const defaultDemoAccount = demoAccounts[0];

export function findDemoAccountByEmail(email: string): DemoUser | undefined {
  return demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}
