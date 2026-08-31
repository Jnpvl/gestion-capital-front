"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNavIcon } from "@/presentation/components/admin/admin-nav-icon";
import { getAdminNavigation } from "@/shared/config/admin-nav";
import { useAuth } from "@/presentation/providers/auth-provider";
import { cn } from "@/shared/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(href);
}

export function AdminSidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const navigation = getAdminNavigation(user?.role ?? "teacher");

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
      {navigation.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      active
                        ? "bg-brand-blue text-white"
                        : "text-brand-gray hover:bg-brand-light",
                    )}
                  >
                    <AdminNavIcon icon={item.icon} />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && !active && (
                      <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-muted">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
