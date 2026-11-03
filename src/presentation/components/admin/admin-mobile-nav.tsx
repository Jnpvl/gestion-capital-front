"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminNavigation, type AdminNavSection } from "@/shared/config/admin-nav";
import { useOptionalAuth } from "@/presentation/providers/auth-provider";
import { cn } from "@/shared/lib/cn";

function isActive(pathname: string, href: string, rootHref: string) {
  if (href === rootHref) {
    return pathname === rootHref;
  }
  return pathname.startsWith(href);
}

/** Por defecto, el menú admin; el portal de empresa pasa su propio menú y raíz. */
export function AdminMobileNav({
  navigation: customNavigation,
  rootHref = "/admin",
}: { navigation?: AdminNavSection[]; rootHref?: string } = {}) {
  const pathname = usePathname();
  const user = useOptionalAuth()?.user;
  const items = (customNavigation ?? getAdminNavigation(user?.role ?? "teacher")).flatMap((section) => section.items);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href, rootHref);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-blue text-white" : "bg-brand-light text-brand-gray",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
