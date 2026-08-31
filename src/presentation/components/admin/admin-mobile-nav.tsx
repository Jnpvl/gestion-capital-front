"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminNavigation } from "@/shared/config/admin-nav";
import { useAuth } from "@/presentation/providers/auth-provider";
import { cn } from "@/shared/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(href);
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = getAdminNavigation(user?.role ?? "teacher").flatMap((section) => section.items);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
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
