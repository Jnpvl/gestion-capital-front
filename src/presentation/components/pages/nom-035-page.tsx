import { ButtonLink } from "@/presentation/components/ui/button-link";
import { Container } from "@/presentation/components/ui/container";
import { nom035Content } from "@/shared/content";

const RISK_BARS = [
  "bg-emerald-500",
  "bg-lime-500",
  "bg-amber-400",
  "bg-orange-500",
  "bg-red-600",
] as const;

export function Nom035PageView() {
  const {
    hero,
    whatIs,
    origin,
    obligationsBySize,
    guides,
    riskLevels,
    compliance,
    solutions,
    comparison,
    benefits,
    cta,
    brand,
    normative,
  } = nom035Content;

  return (
    <>
      {/* Portada: título + pregunta + párrafos de apertura */}
      <section className="relative overflow-hidden border-b border-brand-line bg-brand-light pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(46,49,146,0.12),transparent_55%)] lg:block"
          aria-hidden="true"
        />
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-brand-gray sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-brand-blue sm:text-base">
              {hero.subtitle}
            </p>
            <p className="mt-8 font-display text-2xl font-bold leading-snug text-brand-gray sm:text-3xl">
              {hero.question}
            </p>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-muted">
              {hero.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              {hero.bridge}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={cta.primaryHref} variant="secondary" size="lg">
                {cta.primaryLabel}
              </ButtonLink>
              <ButtonLink href="/empresa/login" variant="outline" size="lg">
                Acceder como empresa
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ¿Qué es la NOM-035...? + situaciones cotidianas */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
              {whatIs.title}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-brand-muted">{whatIs.definition}</p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl">
            <h3 className="text-center font-display text-xl font-bold text-brand-gray sm:text-2xl">
              {whatIs.riskPrompt}
            </h3>
            <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {whatIs.riskItems.map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-sm text-brand-gray sm:text-base">
                  <span className="mt-0.5 font-display text-sm font-bold text-brand-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4">
              <p className="text-sm leading-relaxed text-brand-muted sm:text-base">{whatIs.riskNote}</p>
              <p className="border-l-2 border-brand-gold pl-4 text-sm leading-relaxed text-brand-muted">
                {whatIs.disclaimer}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ¿De dónde surge esta norma? */}
      <section className="border-y border-brand-line bg-brand-light py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
                {origin.title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-brand-muted">{origin.description}</p>
              <p className="mt-4 text-sm leading-relaxed text-brand-muted">{origin.antecedent}</p>
            </div>

            <div className="lg:col-span-7">
              <div className="relative grid gap-6 sm:grid-cols-2">
                <div
                  className="pointer-events-none absolute top-8 right-6 left-6 hidden h-px bg-brand-line sm:block"
                  aria-hidden="true"
                />
                {origin.stages.map((stage, index) => (
                  <article
                    key={stage.date}
                    className="relative rounded-2xl border border-brand-line bg-white p-6"
                  >
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-brand-gray">
                      {stage.date}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      {stage.description}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-6 text-sm font-semibold text-brand-blue">{origin.footnote}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ¿Tu empresa está obligada a cumplirla? */}
      <section className="bg-brand-blue py-16 text-white sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{obligationsBySize.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              {obligationsBySize.answer}
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {obligationsBySize.tiers.map((tier, index) => (
              <article
                key={tier.size}
                className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
                  {String(index + 1).padStart(2, "0")} · {tier.label}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold">{tier.size}</h3>
                <ul className="mt-5 space-y-3">
                  {tier.items.map((item) => (
                    <li key={item} className="text-sm leading-relaxed text-white/75">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-white/70">
            {obligationsBySize.note}
          </p>
        </Container>
      </section>

      {/* ¿Qué se evalúa mediante la NOM-035? */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
              {guides.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-muted">{guides.description}</p>
          </div>

          <div className="mt-12 divide-y divide-brand-line border-y border-brand-line">
            {guides.items.map((guide) => (
              <article
                key={guide.name}
                className="grid gap-3 py-6 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[8.5rem_14rem_minmax(0,1fr)]"
              >
                <p className="font-display text-xl font-bold text-brand-blue">{guide.name}</p>
                <h3 className="font-display text-base font-bold text-brand-gray sm:text-lg">
                  {guide.subtitle}
                </h3>
                <p className="text-sm leading-relaxed text-brand-muted lg:pt-0.5">
                  {guide.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Conoce los niveles de riesgo */}
      <section className="bg-brand-light py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
              {riskLevels.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-muted">
              {riskLevels.description}
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-brand-line bg-white">
            <div className="grid sm:grid-cols-5">
              {riskLevels.levels.map((level, index) => (
                <article
                  key={level.name}
                  className={`border-brand-line p-5 ${index > 0 ? "border-t sm:border-t-0 sm:border-l" : ""}`}
                >
                  <div className={`mb-4 h-1.5 w-full rounded-full ${RISK_BARS[index]}`} />
                  <h3 className="font-display text-sm font-bold text-brand-gray">{level.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-brand-muted sm:text-sm">
                    {level.meaning}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-brand-muted">
            {riskLevels.note}
          </p>
        </Container>
      </section>

      {/* ¿Qué debe hacer tu empresa para cumplir? */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
                {compliance.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-muted">{compliance.intro}</p>
            </div>

            <div className="lg:col-span-8">
              <ul className="grid gap-3 sm:grid-cols-2">
                {compliance.companyItems.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-brand-gray">
                    <span className="mt-1 text-brand-blue" aria-hidden="true">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-l-2 border-brand-gold pl-5 text-sm leading-relaxed text-brand-muted">
                {compliance.workersNote}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Soluciones Gestiona */}
      <section className="bg-brand-light py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
              {solutions.title}
            </h2>
            <p className="mt-3 text-lg font-semibold text-brand-blue">{solutions.subtitle}</p>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-brand-muted">
              <p>{solutions.description}</p>
              <p>{solutions.descriptionExtra}</p>
            </div>
          </div>

          <h3 className="mt-14 text-center font-display text-xl font-bold text-brand-gray">
            {solutions.optionsTitle}
          </h3>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {solutions.options.map((option, index) => (
              <article
                key={option.key}
                className={`flex flex-col rounded-2xl border bg-white p-7 sm:p-8 ${
                  index === 0
                    ? "border-brand-blue/30 shadow-[0_12px_40px_-24px_rgba(46,49,146,0.45)]"
                    : "border-brand-line"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
                  {option.badge}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-brand-gray">
                  {option.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-brand-blue">{option.subtitle}</p>
                <p className="mt-5 font-display text-lg font-bold leading-snug text-brand-gray">
                  {option.highlight}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">{option.description}</p>

                <p className="mt-6 text-sm font-semibold text-brand-gray">{option.includesTitle}</p>
                <ul className="mt-3 flex-1 space-y-2.5">
                  {option.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-brand-muted">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 border-t border-brand-line pt-6">
                  <p className="text-sm font-semibold text-brand-gray">{option.closing}</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{option.audience}</p>
                  <div className="mt-5">
                    <ButtonLink
                      href={option.ctaHref}
                      variant={index === 0 ? "secondary" : "outline"}
                      size="md"
                    >
                      {option.ctaLabel}
                    </ButtonLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ¿Por qué elegir entre una u otra? */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-2xl font-bold text-brand-gray sm:text-3xl">
              {comparison.title}
            </h2>

            <ul className="mt-10 divide-y divide-brand-line border-y border-brand-line">
              {comparison.rows.map((row) => (
                <li
                  key={row.need}
                  className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center sm:gap-8"
                >
                  <span className="text-sm text-brand-gray sm:text-base">{row.need}</span>
                  <span className="text-sm font-semibold text-brand-blue sm:text-right">
                    {row.solution}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-center text-sm leading-relaxed text-brand-muted">
              {comparison.note}
            </p>
          </div>
        </Container>
      </section>

      {/* Más que cumplir una norma... */}
      <section className="border-y border-brand-line bg-brand-light py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <h2 className="font-display text-2xl font-bold text-brand-gray sm:text-3xl">
                {benefits.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-muted">
                {benefits.description}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-brand-muted">{benefits.closing}</p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {benefits.items.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-brand-gray sm:text-base"
                >
                  <span className="font-display text-sm font-bold text-brand-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* CTA final */}
      <section className="bg-brand-blue py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {cta.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              {cta.description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={cta.primaryHref} variant="primary" size="lg">
                {cta.primaryLabel}
              </ButtonLink>
              <ButtonLink href="/empresa/login" variant="inverse" size="lg">
                Acceder como empresa
              </ButtonLink>
            </div>
            <div className="mt-10 border-t border-white/15 pt-8">
              <p className="font-display text-lg font-bold text-white">{brand.name}</p>
              <p className="mt-1 text-sm text-white/70">{brand.tagline}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Referencia normativa */}
      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
                {normative.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{normative.text}</p>
            </div>
            <ButtonLink href={normative.href} variant="outline" size="sm" external>
              {normative.linkLabel}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
