"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { companyAuthStorage } from "@/infrastructure/auth/company-auth-storage";
import { getPortalCompany, type PortalCompany } from "@/infrastructure/http/company-portal-api";
import { AdminMobileNav } from "@/presentation/components/admin/admin-mobile-nav";
import { AdminSidebarNav } from "@/presentation/components/admin/admin-sidebar-nav";
import { Logo } from "@/presentation/components/ui/logo";
import type { AdminNavSection } from "@/shared/config/admin-nav";

const COMPANY_NAV: AdminNavSection[] = [
  {
    title: "Mi empresa",
    items: [
      { label: "Dashboard", href: "/empresa", icon: "dashboard" },
      { label: "Datos generales", href: "/empresa/datos-generales", icon: "companies" },
      { label: "Empleados", href: "/empresa/empleados", icon: "students" },
    ],
  },
];

const CompanyPortalContext = createContext<PortalCompany | null>(null);

/** Empresa de la sesión (siempre la del token de empresa). */
export function usePortalCompany(): PortalCompany {
  const company = useContext(CompanyPortalContext);
  if (!company) throw new Error("usePortalCompany fuera de CompanyPortalShell");
  return company;
}

/** Layout del portal de empresa: mismo sidebar que el admin, solo lectura. */
export function CompanyPortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [company, setCompany] = useState<PortalCompany | null>(null);

  const logout = useCallback(() => {
    companyAuthStorage.clearToken();
    router.replace("/empresa/login");
  }, [router]);

  useEffect(() => {
    if (!companyAuthStorage.getToken()) {
      router.replace("/empresa/login");
      return;
    }
    getPortalCompany()
      .then((r) => setCompany(r.company))
      .catch(logout);
  }, [router, logout]);

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light">
        <p className="text-sm text-brand-muted">Cargando portal...</p>
      </div>
    );
  }

  return (
    <CompanyPortalContext.Provider value={company}>
      <div className="flex min-h-screen bg-brand-light">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-line bg-white lg:flex">
          <div className="border-b border-brand-line px-5 py-5">
            <Link href="/empresa">
              <Logo />
            </Link>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Portal de empresas
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-brand-gray">{company.name}</p>
          </div>

          <AdminSidebarNav navigation={COMPANY_NAV} rootHref="/empresa" />

          <div className="border-t border-brand-line px-4 py-4">
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-brand-gray hover:text-brand-black hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-brand-line bg-white px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="lg:hidden">
                <Link href="/empresa">
                  <Logo />
                </Link>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm text-brand-muted">Bienvenido</p>
                <p className="font-display text-lg font-bold text-brand-gray">{company.name}</p>
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
              <AdminMobileNav navigation={COMPANY_NAV} rootHref="/empresa" />
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </CompanyPortalContext.Provider>
  );
}
