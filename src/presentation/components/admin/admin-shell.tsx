"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminMobileNav } from "@/presentation/components/admin/admin-mobile-nav";
import { AdminSidebarNav } from "@/presentation/components/admin/admin-sidebar-nav";
import { Logo } from "@/presentation/components/ui/logo";
import { useAuth } from "@/presentation/providers/auth-provider";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/admin/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light">
        <p className="text-sm text-brand-muted">Cargando panel...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-brand-light">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-line bg-white lg:flex">
        <div className="border-b border-brand-line px-5 py-5">
          <Link href="/admin">
            <Logo />
          </Link>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Panel administrativo
          </p>
        </div>

        <AdminSidebarNav />

        <div className="border-t border-brand-line px-4 py-4">
          <p className="truncate text-sm font-medium text-brand-gray">{user.name}</p>
          <p className="truncate text-xs text-brand-muted">{user.email}</p>
          <p className="mt-1 text-xs capitalize text-brand-blue">{user.role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 text-sm font-medium text-brand-gray hover:text-brand-black hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-brand-line bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <Link href="/admin">
                <Logo />
              </Link>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-brand-muted">Bienvenido</p>
              <p className="font-display text-lg font-bold text-brand-gray">{user.name}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-brand-gray hover:text-brand-black lg:hidden"
            >
              Salir
            </button>
          </div>

          <div className="mt-4 lg:hidden">
            <AdminMobileNav />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
