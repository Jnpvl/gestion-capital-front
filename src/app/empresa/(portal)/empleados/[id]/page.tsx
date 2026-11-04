import { CompanyEmployeeDetail } from "@/presentation/components/company/company-employee-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanyEmployeeDetail key={id} studentId={id} />;
}
