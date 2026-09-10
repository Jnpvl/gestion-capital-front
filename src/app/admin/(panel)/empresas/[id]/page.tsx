import { CompanyDetailContent } from "@/presentation/components/admin/companies/company-detail-content";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEmpresaDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = await params;
  return <CompanyDetailContent companyId={id} />;
}
