import { siteConfig, socialLinks } from "@/shared/content";
import { seoConfig } from "@/shared/config/seo";

export function JsonLd() {
  const { contact } = siteConfig;
  const whatsappUrl = `https://wa.me/${contact.whatsapp.number}`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Guaymas",
      addressRegion: "Sonora",
      addressCountry: "MX",
    },
    sameAs: socialLinks
      .filter((link) => link.icon !== "email")
      .map((link) => link.href),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: contact.email,
      url: whatsappUrl,
      availableLanguage: "Spanish",
    },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    areaServed: {
      "@type": "State",
      name: "Sonora",
    },
    serviceType: [
      "Consultoría en capital humano",
      "Capacitación laboral",
      "Seguridad e higiene",
      "Cumplimiento normativo",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    </>
  );
}
