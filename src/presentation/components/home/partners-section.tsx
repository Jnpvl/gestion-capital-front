import Image from "next/image";
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

function PartnerLogo({
  name,
  logo,
  className = "h-11 w-28",
}: {
  name: string;
  logo?: string;
  className?: string;
}) {
  if (logo) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-lg border border-brand-gray/20 bg-brand-gray shadow-sm ${className}`}
      >
        <Image src={logo} alt={name} fill className="object-contain p-2" sizes="112px" />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-light text-xs font-bold text-brand-blue">
      {getInitials(name)}
    </div>
  );
}

function PartnerCard({
  name,
  description,
  logo,
}: {
  name: string;
  description?: string;
  logo?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-brand-line bg-white p-6">
      <div className="flex items-center gap-4">
        <PartnerLogo name={name} logo={logo} className="h-12 w-32" />
        <h3 className="font-display text-base font-bold text-brand-gray">{name}</h3>
      </div>
      {description && (
        <p className="mt-4 text-sm leading-relaxed text-brand-muted">{description}</p>
      )}
    </div>
  );
}

function ClientBadge({ name, logo }: { name: string; logo?: string }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl border border-brand-line bg-white px-5 py-4"
      title={name}
    >
      <PartnerLogo name={name} logo={logo} className="h-14 w-36 sm:h-16 sm:w-40" />
    </div>
  );
}

export function PartnersSection() {
  const { allies, clients } = homeContent.partners;
  const clientMarqueeItems = [
    ...clients.items,
    ...clients.items,
    ...clients.items,
    ...clients.items,
  ];

  return (
    <section
      aria-labelledby="partners-heading"
      className="overflow-x-hidden border-y border-brand-line bg-white py-16 sm:py-20"
    >
      <Container>
        <div className="text-center">
          <h2
            id="partners-heading"
            className="font-display text-2xl font-bold text-brand-gray sm:text-3xl"
          >
            {allies.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-brand-muted sm:text-base">
            {allies.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {allies.items.map((partner) => (
            <PartnerCard
              key={partner.name}
              name={partner.name}
              description={partner.description}
              logo={partner.logo}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="font-display text-xl font-bold text-brand-gray sm:text-2xl">
            {clients.title}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-muted sm:text-base">
            {clients.subtitle}
          </p>
        </div>
      </Container>

      <div className="relative mt-10 overflow-hidden motion-reduce:hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24"
          aria-hidden="true"
        />

        <div className="flex w-max animate-partners-marquee gap-4">
          {clientMarqueeItems.map((partner, index) => (
            <ClientBadge key={`${partner.name}-${index}`} name={partner.name} logo={partner.logo} />
          ))}
        </div>
      </div>

      <div className="mt-10 hidden flex-wrap justify-center gap-4 px-4 motion-reduce:flex">
        {clients.items.map((partner) => (
          <ClientBadge key={partner.name} name={partner.name} logo={partner.logo} />
        ))}
      </div>
    </section>
  );
}
