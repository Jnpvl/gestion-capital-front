"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CompanyListItem } from "@/core/domain/students/types";
import { autocompleteCompanies } from "@/infrastructure/http/companies-api";
import { cn } from "@/shared/lib/cn";

interface CompanySelectFieldProps {
  value: string | null;
  selectedLabel?: string | null;
  selectedRfc?: string | null;
  onChange: (companyId: string | null, company: CompanyListItem | null) => void;
  disabled?: boolean;
  required?: boolean;
}

function formatCompanyLabel(name: string, rfc?: string | null) {
  return rfc ? `${name} · RFC ${rfc}` : name;
}

export function CompanySelectField({
  value,
  selectedLabel,
  selectedRfc,
  onChange,
  disabled = false,
  required = false,
}: CompanySelectFieldProps) {
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(selectedLabel ?? "");
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery(selectedLabel ?? "");
  }, [selectedLabel, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const { companies: items } = await autocompleteCompanies(query.trim() || undefined);
          if (!cancelled) {
            setCompanies(items);
          }
        } catch {
          if (!cancelled) setCompanies([]);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, query]);

  const suggestions = useMemo(() => companies.slice(0, 8), [companies]);

  function selectCompany(company: CompanyListItem) {
    onChange(company.id, company);
    setQuery(formatCompanyLabel(company.name, company.rfc));
    setIsOpen(false);
  }

  function handleInputChange(nextQuery: string) {
    setQuery(nextQuery);
    setIsOpen(true);
    if (value) {
      onChange(null, null);
    }
  }

  function handleBlur() {
    window.setTimeout(() => {
      if (!value) {
        setQuery("");
        return;
      }

      if (selectedLabel) {
        setQuery(formatCompanyLabel(selectedLabel, selectedRfc));
      }
    }, 150);
  }

  const showDropdown = isOpen && !disabled && (isLoading || suggestions.length > 0);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="relative">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-brand-gray">
          Empresa {required && "*"}
        </label>

        <input
          id={inputId}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          placeholder="Busca una empresa registrada"
          className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light"
        />

        {showDropdown && (
          <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-brand-line bg-white shadow-lg">
            {isLoading ? (
              <p className="px-3 py-2.5 text-sm text-brand-muted">Buscando empresas...</p>
            ) : suggestions.length > 0 ? (
              <ul className="max-h-52 overflow-y-auto py-1">
                {suggestions.map((company) => (
                  <li key={company.id}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectCompany(company)}
                      className={cn(
                        "flex w-full flex-col items-start px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-light",
                        company.id === value && "bg-brand-blue/5 font-medium text-brand-blue",
                      )}
                    >
                      <span>{company.name}</span>
                      {company.rfc && (
                        <span className="text-xs text-brand-muted">RFC: {company.rfc}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2.5 text-sm text-brand-muted">
                No hay empresas que coincidan.{" "}
                <Link href="/admin/empresas" className="font-medium text-brand-blue hover:underline">
                  Regístrala primero en Empresas
                </Link>
                .
              </p>
            )}
          </div>
        )}

        <p className="mt-1.5 text-xs text-brand-muted">
          Solo puedes elegir empresas ya registradas. Si no existe, créala en{" "}
          <Link href="/admin/empresas" className="font-medium text-brand-blue hover:underline">
            Admin → Empresas
          </Link>
          .
        </p>
      </div>

      {value && selectedRfc && (
        <div className="rounded-lg border border-brand-line bg-brand-light/40 px-4 py-3 text-sm">
          <span className="text-brand-muted">RFC de la empresa: </span>
          <span className="font-medium text-brand-gray">{selectedRfc}</span>
        </div>
      )}
    </div>
  );
}
