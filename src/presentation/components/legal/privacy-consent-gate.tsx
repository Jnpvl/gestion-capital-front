"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/presentation/components/ui/logo";
import { AVISO_PRIVACIDAD_PATH, avisoPrivacidadContent } from "@/shared/content";
import { showError } from "@/shared/lib/alerts";

interface PrivacyConsentGateProps {
  onAccept: () => Promise<void>;
  onDecline: () => void;
}

export function PrivacyConsentGate({ onAccept, onDecline }: PrivacyConsentGateProps) {
  const { gate, lastUpdated, sections } = avisoPrivacidadContent;
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAccept() {
    if (!checked || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAccept();
    } catch {
      showError("No se pudo guardar tu aceptación. Intenta de nuevo.", "Aviso de privacidad");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4 py-10">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-brand-line bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-brand-gray">{gate.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">{gate.intro}</p>
        </div>

        <div className="max-h-[min(50vh,28rem)] space-y-6 overflow-y-auto rounded-xl border border-brand-line bg-brand-light/60 p-4 text-sm leading-relaxed text-brand-muted sm:p-5">
          <p className="text-xs">Última actualización: {lastUpdated}</p>
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="font-semibold text-brand-gray">{section.title}</h2>
              <div className="mt-2 space-y-2">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
                {"bullets" in section && section.bullets ? (
                  <ul className="list-disc space-y-1 pl-4">
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {"closing" in section && section.closing ? <p>{section.closing}</p> : null}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-4 text-center text-sm">
          <Link
            href={AVISO_PRIVACIDAD_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-blue hover:underline"
          >
            {gate.readFullLabel}
          </Link>
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-brand-gray">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-line text-brand-blue"
          />
          <span>{gate.acceptLabel}</span>
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onDecline}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-brand-line px-6 py-3 text-sm font-semibold text-brand-gray transition-colors hover:bg-brand-light disabled:opacity-60 sm:w-auto"
          >
            {gate.declineLabel}
          </button>
          <button
            type="button"
            onClick={() => void handleAccept()}
            disabled={!checked || isSubmitting}
            className="w-full flex-1 rounded-lg bg-brand-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gray disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : gate.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
