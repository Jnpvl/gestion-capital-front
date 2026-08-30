import Link from "next/link";
import { Logo } from "@/presentation/components/ui/logo";
import { Container } from "@/presentation/components/ui/container";
import { footerNavigation, siteConfig, socialLinks } from "@/shared/content";

function SocialIcon({ icon }: { icon: "instagram" | "facebook" | "email" }) {
  if (icon === "instagram") {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    );
  }

  if (icon === "facebook") {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

export function SiteFooter() {
  const { contact, copyright, name, tagline } = siteConfig;
  const whatsappUrl = `https://wa.me/${contact.whatsapp.number}?text=${encodeURIComponent(contact.whatsapp.message)}`;

  return (
    <footer className="border-t border-brand-line bg-brand-light">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo size="md" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-muted">
              {tagline}. Asesoría, capacitación y cumplimiento normativo en {contact.location}.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-muted transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
                >
                  <SocialIcon icon={link.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-brand-gray">Contacto</h3>
              <address className="mt-4 space-y-3 text-sm not-italic text-brand-muted">
                <p>{contact.location}</p>
                <p>
                  <a href={`mailto:${contact.email}`} className="transition-colors hover:text-brand-red">
                    {contact.email}
                  </a>
                </p>
                <p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand-red">
                    WhatsApp
                  </a>
                </p>
              </address>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-brand-gray">Enlaces</h3>
              <ul className="mt-4 space-y-2.5">
                {footerNavigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-brand-muted transition-colors hover:text-brand-blue">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-line pt-8">
          <p className="text-center text-xs text-brand-muted sm:text-left">
            {copyright} · {name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
