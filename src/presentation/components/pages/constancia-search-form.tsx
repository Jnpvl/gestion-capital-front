"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ConstanciaSearchForm({ initialFolio = "" }: { initialFolio?: string }) {
  const router = useRouter();
  const [folio, setFolio] = useState(initialFolio);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = folio.trim().toUpperCase();
    if (!trimmed) {
      setError("Ingresa el folio de la constancia.");
      return;
    }
    setError(null);
    router.push(`/constancia/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="folio" className="block text-sm font-medium text-brand-gray">
          Folio
        </label>
        <input
          id="folio"
          name="folio"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Ej. GCH-2026-XXXXXX"
          value={folio}
          onChange={(event) => {
            setFolio(event.target.value);
            if (error) setError(null);
          }}
          className="mt-2 w-full rounded-xl border border-brand-line bg-white px-4 py-3 font-mono text-sm text-brand-gray outline-none transition-colors placeholder:text-brand-muted/70 focus:border-brand-blue"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto sm:px-6"
      >
        Buscar constancia
      </button>
    </form>
  );
}
