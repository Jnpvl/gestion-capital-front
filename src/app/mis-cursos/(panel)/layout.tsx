import { StudentShell } from "@/presentation/components/student/student-shell";

export default function MisCursosPanelLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
