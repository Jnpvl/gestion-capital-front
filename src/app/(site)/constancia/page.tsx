import type { Metadata } from "next";
import Link from "next/link";
import { ConstanciaSearchForm } from "@/presentation/components/pages/constancia-search-form";
import { Container } from "@/presentation/components/ui/container";
import { seoConfig } from "@/shared/config/seo";

export const metadata: Metadata = {
  title: "Buscar constancia",
  description:
    "Valida una constancia de Gestiona Capital Humano ingresando el folio impreso o el del código QR.",
};

export default function ConstanciaSearchPage() {
  return (
    <section className="bg-brand-light/40 pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-2xl border border-brand-line bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10 md:px-10 md:py-12">
          <p className="text-sm font-medium text-brand-blue">Validación de constancia</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-brand-gray sm:text-3xl">
            Buscar constancia
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            Ingresa el folio que aparece en tu constancia o debajo del código QR para consultar su
            validez.
          </p>

          <ConstanciaSearchForm />

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
