import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/presentation/components/ui/container";
import { env } from "@/shared/config/env";
import { seoConfig } from "@/shared/config/seo";

interface ConstanciaPageProps {
  params: Promise<{ folio: string }>;
}

interface PublicConstanciaVerification {
  valid: true;
  folio: string;
  issuedAt: string | null;
  studentName: string;
  curp: string | null;
  courseTitle: string;
  duration: string | null;
  modality: string;
  period: string;
  location: string;
  instructorName: string | null;
  instructorSpecialty: string | null;
}

async function fetchConstancia(folio: string): Promise<PublicConstanciaVerification | null> {
  try {
    const response = await fetch(
      `${env.apiUrl}/api/constancias/${encodeURIComponent(folio)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return (await response.json()) as PublicConstanciaVerification;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ConstanciaPageProps): Promise<Metadata> {
  const { folio } = await params;
  return {
    title: `Validación de constancia ${folio}`,
    description: "Consulta pública para validar una constancia de Gestiona Capital Humano.",
    robots: { index: false, follow: false },
  };
}

export default async function ConstanciaPublicPage({ params }: ConstanciaPageProps) {
  const { folio } = await params;
  const data = await fetchConstancia(folio);

  return (
    <section className="bg-brand-light/40 pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-2xl border border-brand-line bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10 md:px-10 md:py-12">
          <p className="text-sm font-medium text-brand-blue">Validación de constancia</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-brand-gray sm:text-3xl">
            {data ? "Constancia válida" : "Constancia no encontrada"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            {data
              ? `El folio ${data.folio} acredita que ${data.studentName} concluyó el curso ${data.courseTitle}.`
              : "No existe un folio con estos datos. Verifica el código o el número de folio."}
          </p>

          {data ? (
            <dl className="mt-8 space-y-5 text-sm">
              <div>
                <dt className="text-brand-muted">Folio</dt>
                <dd className="mt-1 font-mono font-semibold text-brand-gray">{data.folio}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Participante</dt>
                <dd className="mt-1 font-medium text-brand-gray">{data.studentName}</dd>
              </div>
              {data.curp && (
                <div>
                  <dt className="text-brand-muted">CURP</dt>
                  <dd className="mt-1 font-mono text-brand-gray">{data.curp}</dd>
                </div>
              )}
              <div>
                <dt className="text-brand-muted">Curso</dt>
                <dd className="mt-1 font-medium text-brand-gray">{data.courseTitle}</dd>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-brand-muted">Modalidad</dt>
                  <dd className="mt-1 text-brand-gray">{data.modality}</dd>
                </div>
                <div>
                  <dt className="text-brand-muted">Duración</dt>
                  <dd className="mt-1 text-brand-gray">{data.duration ?? "—"}</dd>
                </div>
              </div>
              <div>
                <dt className="text-brand-muted">Periodo</dt>
                <dd className="mt-1 text-brand-gray">{data.period}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Lugar de expedición</dt>
                <dd className="mt-1 text-brand-gray">{data.location}</dd>
              </div>
              {data.instructorName && (
                <div>
                  <dt className="text-brand-muted">Instructor</dt>
                  <dd className="mt-1 text-brand-gray">
                    {data.instructorName}
                    {data.instructorSpecialty ? ` · ${data.instructorSpecialty}` : ""}
                  </dd>
                </div>
              )}
              {data.issuedAt && (
                <div>
                  <dt className="text-brand-muted">Fecha de emisión</dt>
                  <dd className="mt-1 text-brand-gray">{data.issuedAt}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-8 rounded-xl bg-brand-light/70 px-4 py-3 font-mono text-sm text-brand-gray">
              Folio consultado: {folio}
            </p>
          )}

          <div className="mt-10 border-t border-brand-line pt-6">
            <Link href="/" className="text-sm font-medium text-brand-blue hover:underline">
              Ir a {seoConfig.defaultTitle}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
