"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/presentation/components/admin/admin-page-header";
import { useAuth } from "@/presentation/providers/auth-provider";
import { getAdminNavigation } from "@/shared/config/admin-nav";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const quickLinks = getAdminNavigation(user?.role ?? "teacher")
    .flatMap((section) => section.items)
    .filter((item) => item.href !== "/admin");

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Resumen del panel de Gestiona Capital Humano. Gestiona cursos y estudiantes desde el menú lateral."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-brand-line bg-white p-5 transition-colors hover:border-brand-blue/30"
          >
            <p className="text-sm text-brand-muted">{item.label}</p>
            <p className="mt-2 font-display text-lg font-bold text-brand-gray">
              {item.badge ?? "Abrir"}
            </p>
            {item.description && (
              <p className="mt-2 text-xs text-brand-muted">{item.description}</p>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
