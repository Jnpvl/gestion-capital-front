import type { Metadata } from "next";
import { StudentAuthProvider } from "@/presentation/providers/student-auth-provider";

export const metadata: Metadata = {
  title: "Mis cursos",
  robots: { index: false, follow: false },
};

export default function MisCursosRootLayout({ children }: { children: React.ReactNode }) {
  return <StudentAuthProvider>{children}</StudentAuthProvider>;
}
