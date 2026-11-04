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
import type { StudentUser } from "@/core/domain/student/types";
import { studentAuthStorage } from "@/infrastructure/auth/student-auth-storage";
import { ApiClientError, acceptStudentPrivacy, getStudentMe, studentLogin } from "@/infrastructure/http/student-auth-api";

interface StudentAuthContextValue {
  user: StudentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptPrivacy: () => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [sessionRevision, setSessionRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const token = studentAuthStorage.getToken();
    const request = token ? getStudentMe(token) : Promise.resolve(null);
    request.then(session => {
      if (!cancelled && studentAuthStorage.getToken() === token) setUser(session?.user ?? null);
    }).catch(error => {
      if (cancelled) return;
      if (error instanceof ApiClientError && error.status === 401) {
        // The HTTP layer clears only the matching session and opens its login.
        if (!studentAuthStorage.getToken()) setUser(null);
      } else {
        setSessionError(true);
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [sessionRevision]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: studentUser } = await studentLogin(email, password);
    studentAuthStorage.setToken(token);
    setUser(studentUser);
  }, []);

  const acceptPrivacy = useCallback(async () => {
    const token = studentAuthStorage.getToken();
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    const { user: studentUser } = await acceptStudentPrivacy(token);
    setUser(studentUser);
  }, []);

  const logout = useCallback(() => {
    studentAuthStorage.clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      acceptPrivacy,
      logout,
    }),
    [user, isLoading, login, acceptPrivacy, logout],
  );

  if (sessionError) return <SessionLoadError onRetry={() => { setSessionError(false); setIsLoading(true); setSessionRevision(value => value + 1); }} />;

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>;
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error("useStudentAuth debe usarse dentro de StudentAuthProvider");
  }
  return context;
}

export { ApiClientError };
