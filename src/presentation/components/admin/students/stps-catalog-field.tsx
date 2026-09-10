"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { listStpsOccupations, listStpsThematicAreas } from "@/infrastructure/http/stps-api";
import { cn } from "@/shared/lib/cn";

type CatalogKind = "occupation" | "thematic-area";

interface StpsCatalogFieldProps {
  kind: CatalogKind;
  value: string;
  selectedLabel?: string | null;
  onChange: (code: string, label: string) => void;
  disabled?: boolean;
  required?: boolean;
}

function formatOccupationLabel(code: string, name: string) {
  return `${code} — ${name}`;
}

export function StpsCatalogField({
  kind,
  value,
  selectedLabel,
  onChange,
  disabled = false,
  required = false,
}: StpsCatalogFieldProps) {
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(selectedLabel ?? "");
  const [items, setItems] = useState<Array<{ code: string; label: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const label =
    kind === "occupation" ? "Puesto (catálogo STPS)" : "Área temática (catálogo STPS)";
  const placeholder =
    kind === "occupation"
      ? "Busca por clave o nombre de ocupación"
      : "Busca por clave o nombre de área temática";

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
          if (kind === "occupation") {
            const { occupations } = await listStpsOccupations(query.trim() || undefined);
            if (!cancelled) {
              setItems(
                occupations.map((item) => ({
                  code: item.code,
                  label: formatOccupationLabel(item.code, item.name),
                })),
              );
            }
          } else {
            const { thematicAreas } = await listStpsThematicAreas(query.trim() || undefined);
            if (!cancelled) {
              setItems(
                thematicAreas.map((item) => ({
                  code: item.code,
                  label: `${item.code} — ${item.name}`,
                })),
              );
            }
          }
        } catch {
          if (!cancelled) setItems([]);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, kind, query]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = normalized
      ? items.filter(
          (item) =>
            item.label.toLowerCase().includes(normalized) ||
            item.code.toLowerCase().includes(normalized),
        )
      : items;

    return matches.slice(0, 10);
  }, [items, query]);

  const showDropdown =
    isOpen && !disabled && (isLoading || suggestions.length > 0 || query.trim().length > 0);

  function selectItem(code: string, label: string) {
    onChange(code, label);
    setQuery(label);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-brand-gray">
        {label} {required && "*"}
      </label>

      <input
        id={inputId}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!e.target.value.trim()) {
            onChange("", "");
          }
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        placeholder={placeholder}
        className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light"
      />

      {value && (
        <p className="mt-1 text-xs text-brand-muted">
          Clave seleccionada: <span className="font-medium text-brand-gray">{value}</span>
        </p>
      )}

      {showDropdown && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-brand-line bg-white shadow-lg">
          {isLoading ? (
            <p className="px-3 py-2.5 text-sm text-brand-muted">Buscando en catálogo STPS...</p>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-52 overflow-y-auto py-1">
              {suggestions.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectItem(item.code, item.label)}
                    className={cn(
                      "flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-light",
                      item.code === value && "bg-brand-blue/5 font-medium text-brand-blue",
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2.5 text-sm text-brand-muted">
              No hay coincidencias en el catálogo STPS.
            </p>
          )}
        </div>
      )}

      <p className="mt-1.5 text-xs text-brand-muted">
        Catálogo oficial STPS para constancias y DC3.
      </p>
    </div>
  );
}
