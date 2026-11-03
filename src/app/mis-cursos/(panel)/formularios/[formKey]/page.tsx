import { StudentFormAnswer } from "@/presentation/components/student/student-form-answer";

export default async function StudentFormPage({ params }: { params: Promise<{ formKey: string }> }) {
  const { formKey } = await params;
  return <StudentFormAnswer formKey={formKey} />;
}
