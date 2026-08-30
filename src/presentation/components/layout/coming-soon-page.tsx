import { Container } from "@/presentation/components/ui/container";

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <section className="bg-brand-light px-4 pb-20 pt-28 sm:py-28 sm:pt-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-light text-brand-gray sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base font-light text-brand-muted">
            {description ?? "Esta sección estará disponible próximamente."}
          </p>
        </div>
      </Container>
    </section>
  );
}
