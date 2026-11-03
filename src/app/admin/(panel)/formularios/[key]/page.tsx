import { FormPreviewContent } from "@/presentation/components/admin/forms/form-preview-content";

interface FormPreviewPageProps {
  params: Promise<{ key: string }>;
}

export default async function AdminFormPreviewPage({ params }: FormPreviewPageProps) {
  const { key } = await params;
  return <FormPreviewContent formKey={key} />;
}
