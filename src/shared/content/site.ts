export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "instagram" | "facebook" | "email";
}

export const siteConfig = {
  name: "Gestiona Capital Humano",
  shortName: "Gestiona",
  tagline: "Consultoría en capital humano y cumplimiento empresarial",
  contact: {
    email: "la@gestionach.com",
    location: "Guaymas, Sonora, México",
    whatsapp: {
      number: "526221792472",
      message:
        "Hola, solicito información sobre los servicios de asesoría y capacitación. Muchas gracias.",
    },
  },
  copyright: `© ${new Date().getFullYear()} Gestiona Capital Humano. Todos los derechos reservados.`,
} as const;

export const mainNavigation: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Eventos", href: "/eventos" },
  { label: "Contacto", href: "/contacto" },
];

export const footerNavigation: NavItem[] = [
  { label: "¿Quiénes somos?", href: "/quienes-somos" },
  { label: "¿Por qué elegirnos?", href: "/por-que-elegirnos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Eventos", href: "/eventos" },
  { label: "Contacto", href: "/contacto" },
];

export const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/gestionach/",
    icon: "instagram",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61592745845144",
    icon: "facebook",
  },
  {
    label: "Email",
    href: "mailto:la@gestionach.com",
    icon: "email",
  },
];
