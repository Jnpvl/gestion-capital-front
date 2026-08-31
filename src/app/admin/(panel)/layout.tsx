import type { ReactNode } from "react";
import { AdminShell } from "@/presentation/components/admin/admin-shell";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
