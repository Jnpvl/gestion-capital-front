import { redirect } from "next/navigation";

interface EstudiantesDetailRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEstudianteDetailRedirectPage({
  params,
}: EstudiantesDetailRedirectPageProps) {
  const { id } = await params;
  redirect(`/admin/alumnos/${id}`);
}
