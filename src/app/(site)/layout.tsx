import type { ReactNode } from "react";
import { MainLayout } from "@/presentation/components/layout/main-layout";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
