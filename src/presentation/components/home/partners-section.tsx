import { Container } from "@/presentation/components/ui/container";
import { homeContent } from "@/shared/content";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function PartnerBadge({ name }: { name: string }) {
  return (
    <div className="flex shrink-0 items-center gap-4 rounded-xl border border-brand-line bg-white px-6 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-xs font-bold text-brand-blue">
        {getInitials(name)}
      </div>
      <span className="whitespace-nowrap text-sm font-medium text-brand-muted">{name}</span>
    </div>
  );
}

export function PartnersSection() {
  const { partners } = homeContent;
  const marqueeItems = [...partners.items, ...partners.items];

  return (
    <section
      aria-labelledby="partners-heading"
      className="overflow-hidden border-y border-brand-line bg-white py-16 sm:py-20"
    >
      <Container>
        <div className="text-center">
          <h2
            id="partners-heading"
            className="font-display text-2xl font-bold text-brand-gray sm:text-3xl"
          >
            {partners.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-muted sm:text-base">
            {partners.subtitle}
          </p>
        </div>
      </Container>

      <div className="relative mt-10 motion-reduce:hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24"
          aria-hidden="true"
        />

        <div className="flex w-max animate-partners-marquee gap-4 px-4">
          {marqueeItems.map((partner, index) => (
            <PartnerBadge key={`${partner.name}-${index}`} name={partner.name} />
          ))}
        </div>
      </div>

      <div className="mt-10 hidden flex-wrap justify-center gap-4 px-4 motion-reduce:flex">
        {partners.items.map((partner) => (
          <PartnerBadge key={partner.name} name={partner.name} />
        ))}
      </div>
    </section>
  );
}
