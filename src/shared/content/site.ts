export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "instagram" | "linkedin" | "email";
}

export const siteConfig = {
  name: "Gestiona Capital Humano",
  shortName: "Gestiona",
  tagline: "Consultoría en capital humano y cumplimiento empresarial",
  contact: {
    email: "hola@gestionach.com",
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
  { label: "Cursos", href: "/cursos" },
  { label: "Eventos", href: "/eventos" },
  { label: "Contacto", href: "/contacto" },
];

export const footerNavigation: NavItem[] = [
  { label: "¿Quiénes somos?", href: "/quienes-somos" },
  { label: "¿Por qué elegirnos?", href: "/por-que-elegirnos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Cursos", href: "/cursos" },
  { label: "Eventos", href: "/eventos" },
  { label: "Contacto", href: "/contacto" },
];

export const legalNavigation: NavItem[] = [
  { label: "Aviso de privacidad", href: "/aviso-de-privacidad" },
  { label: "Políticas", href: "/politicas" },
];

export const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/gestionach/",
    icon: "instagram",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/gestiona-capital-humano/about/?viewAsMember=true",
    icon: "linkedin",
  },
  {
    label: "Email",
    href: "mailto:hola@gestionach.com",
    icon: "email",
  },
];
