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
import type { StudentUser } from "@/core/domain/student/types";
import { studentAuthStorage } from "@/infrastructure/auth/student-auth-storage";
import { ApiClientError, getStudentMe, studentLogin } from "@/infrastructure/http/student-auth-api";

interface StudentAuthContextValue {
  user: StudentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = studentAuthStorage.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user: studentUser } = await getStudentMe(token);
      setUser(studentUser);
    } catch {
      studentAuthStorage.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: studentUser } = await studentLogin(email, password);
    studentAuthStorage.setToken(token);
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
      logout,
    }),
    [user, isLoading, login, logout],
  );

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
