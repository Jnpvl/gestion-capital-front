import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CompanyPortalShell } from "@/presentation/components/company/company-portal-shell";

export const metadata: Metadata = {
  title: "Portal de empresas",
  robots: { index: false, follow: false },
};

export default function CompanyPortalLayout({ children }: { children: ReactNode }) {
  return <CompanyPortalShell>{children}</CompanyPortalShell>;
}
