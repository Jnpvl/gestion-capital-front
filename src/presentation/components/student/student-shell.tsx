"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/presentation/components/ui/logo";
import { useStudentAuth } from "@/presentation/providers/student-auth-provider";

interface StudentShellProps {
  children: React.ReactNode;
}

export function StudentShell({ children }: StudentShellProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useStudentAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/mis-cursos/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light">
        <p className="text-sm text-brand-muted">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-light">
      <header className="border-b border-brand-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/mis-cursos" className="shrink-0">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-brand-gray">{user.name}</p>
              <p className="text-xs text-brand-muted">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/mis-cursos/login");
              }}
              className="text-sm font-medium text-brand-gray hover:text-brand-black hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
