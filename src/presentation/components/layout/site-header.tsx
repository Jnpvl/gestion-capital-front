"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/presentation/components/ui/button-link";
import { Logo } from "@/presentation/components/ui/logo";
import { Container } from "@/presentation/components/ui/container";
import { cn } from "@/shared/lib/cn";
import { mainNavigation } from "@/shared/content";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-brand-line bg-white/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white/90 backdrop-blur-sm",
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between lg:h-[76px]">
          <Link href="/" className="shrink-0" onClick={() => setIsMenuOpen(false)}>
            <Logo size="sm" priority />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-brand-blue"
                    : "text-brand-muted hover:text-brand-gray",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ButtonLink href="/mis-cursos/login" variant="outline" size="sm">
              Ingresar a mis cursos
            </ButtonLink>
            <ButtonLink href="/contacto" variant="primary" size="sm">
              Contactar
            </ButtonLink>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-brand-dark lg:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {isMenuOpen && (
        <nav className="border-t border-brand-line bg-white lg:hidden" aria-label="Móvil">
          <Container>
            <ul className="flex flex-col gap-1 py-4">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-3 text-sm font-medium",
                      isActive(item.href)
                        ? "text-brand-blue"
                        : "text-brand-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2 space-y-2">
                <ButtonLink href="/mis-cursos/login" variant="outline" className="w-full">
                  Ingresar a mis cursos
                </ButtonLink>
                <ButtonLink href="/contacto" variant="primary" className="w-full">
                  Contactar
                </ButtonLink>
              </li>
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
