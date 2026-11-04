"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SessionLoadError } from "@/presentation/components/ui/session-load-error";
import type { StaffUser } from "@/core/domain/auth/types";
import { authStorage } from "@/infrastructure/auth/auth-storage";
import { ApiClientError, getStaffMe, staffLogin } from "@/infrastructure/http/auth-api";

interface AuthContextValue {
  user: StaffUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [sessionRevision, setSessionRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const token = authStorage.getToken();
    const request = token ? getStaffMe(token) : Promise.resolve(null);
    request.then(session => {
      if (!cancelled && authStorage.getToken() === token) setUser(session?.user ?? null);
    }).catch(error => {
      if (cancelled) return;
      if (error instanceof ApiClientError && error.status === 401) {
        // The HTTP layer clears only the matching session and opens its login.
        if (!authStorage.getToken()) setUser(null);
      } else {
        setSessionError(true);
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [sessionRevision]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: staffUser } = await staffLogin(email, password);
    authStorage.setToken(token);
    setUser(staffUser);
  }, []);

  const logout = useCallback(() => {
    authStorage.clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  if (sessionError) return <SessionLoadError onRetry={() => { setSessionError(false); setIsLoading(true); setSessionRevision(value => value + 1); }} />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

/** Igual que useAuth, pero devuelve null fuera de AuthProvider (p. ej. portal de empresa). */
export function useOptionalAuth() {
  return useContext(AuthContext);
}

export { ApiClientError };
