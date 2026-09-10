"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  filterStpsThematicAreas,
  findStpsThematicAreaByCode,
} from "@/shared/content/stps-thematic-areas-catalog";
import { cn } from "@/shared/lib/cn";

interface StpsThematicAreaFieldProps {
  value: string;
  selectedLabel?: string | null;
  onChange: (code: string, label: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function StpsThematicAreaField({
  value,
  selectedLabel,
  onChange,
  disabled = false,
  required = false,
}: StpsThematicAreaFieldProps) {
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(selectedLabel ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value && selectedLabel) {
      setQuery(selectedLabel);
      return;
    }

    const match = value ? findStpsThematicAreaByCode(value) : undefined;
    setQuery(match?.label ?? selectedLabel ?? "");
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

  const suggestions = useMemo(() => filterStpsThematicAreas(query, 12), [query]);

  const showDropdown = isOpen && !disabled;

  function selectItem(code: string, label: string) {
    onChange(code, label);
    setQuery(label);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-brand-gray">
        Área temática del curso {required && "*"}
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
        placeholder="Busca por clave o descripción"
        className="w-full rounded-lg border border-brand-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-blue disabled:bg-brand-light"
      />

      {value && (
        <p className="mt-1 text-xs text-brand-muted">
          Clave seleccionada: <span className="font-medium text-brand-gray">{value}</span>
        </p>
      )}

      {showDropdown && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-brand-line bg-white shadow-lg">
          {suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto py-1">
              {suggestions.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectItem(item.code, item.label)}
                    className={cn(
                      "flex w-full flex-col items-start px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-light",
                      item.code === value && "bg-brand-blue/5 font-medium text-brand-blue",
                    )}
                  >
                    <span className="font-medium text-brand-gray">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2.5 text-sm text-brand-muted">
              No hay coincidencias en el catálogo de áreas temáticas.
            </p>
          )}
        </div>
      )}

      <p className="mt-1.5 text-xs text-brand-muted">
        Catálogo oficial STPS — escribe para filtrar por clave o descripción.
      </p>
    </div>
  );
}
