/**
 * Mock authentication context. Session is persisted to sessionStorage so a
 * page refresh keeps the user logged in. No real backend — this is a demo.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '../config/navTypes';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  hasRole: (role: Role | Role[]) => boolean;
}

const STORAGE_KEY = 'ezaxis.auth.user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => readStoredUser());

  // Keep the auth slice in Redux in sync is handled by callers; here we only
  // persist to sessionStorage.
  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore storage errors */
    }
  }, [currentUser]);

  const login = useCallback((user: AuthUser) => {
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    // Redirect to login; using location keeps logout simple from anywhere.
    window.location.assign('/login');
  }, []);

  const hasRole = useCallback(
    (role: Role | Role[]) => {
      if (!currentUser) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(currentUser.role);
    },
    [currentUser],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
      hasRole,
    }),
    [currentUser, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
