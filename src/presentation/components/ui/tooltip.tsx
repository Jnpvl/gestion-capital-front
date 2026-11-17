"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/cn";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const trigger = useRef<HTMLSpanElement>(null);
  const id = useId();
  const [position, setPosition] = useState<{ left: number; top: number; above: boolean } | null>(null);
  function show() {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const above = side === "top" ? rect.top > 100 : window.innerHeight - rect.bottom < 100;
    const halfWidth = Math.min(240, window.innerWidth - 24) / 2;
    setPosition({
      left: Math.max(halfWidth + 12, Math.min(window.innerWidth - halfWidth - 12, rect.left + rect.width / 2)),
      top: above ? rect.top - 8 : rect.bottom + 8,
      above,
    });
  }
  useEffect(() => {
    if (!position) return;
    const hide = () => setPosition(null);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") hide(); };
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("keydown", onKey);
    };
  }, [position]);
  return (
    <span ref={trigger} className={cn("relative inline-flex", className)}
      aria-describedby={position ? id : undefined}
      onMouseEnter={show} onMouseLeave={() => setPosition(null)}
      onFocus={show} onBlur={() => setPosition(null)}>
      {children}
      {position && createPortal(<span
        id={id}
        role="tooltip"
        className="pointer-events-none fixed z-[100] w-max max-w-[min(240px,calc(100vw-24px))] whitespace-normal rounded-md bg-brand-gray px-2.5 py-1.5 text-center text-xs font-medium text-white shadow-md"
        style={{ left: position.left, top: position.top, transform: `translate(-50%, ${position.above ? "-100%" : "0"})` }}
      >
        {label}
      </span>, document.body)}
    </span>
  );
}
