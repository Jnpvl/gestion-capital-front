"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentAuth } from "@/presentation/providers/student-auth-provider";

export function StudentLoginRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useStudentAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/mis-cursos");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light">
        <p className="text-sm text-brand-muted">Cargando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
