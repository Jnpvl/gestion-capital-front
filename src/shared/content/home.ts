export interface Partner {
  name: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export const homeContent = {
  hero: {
    eyebrow: "Guaymas, Sonora · Capital humano",
    headline: "Impulsa el talento y el cumplimiento de tu organización",
    subheadline:
      "Asesoría especializada en recursos humanos, capacitación laboral, seguridad e higiene y cumplimiento normativo para empresas que quieren crecer con orden y confianza.",
    primaryCta: { label: "Ver servicios", href: "/servicios" },
    secondaryCta: { label: "Agendar asesoría", href: "/contacto" },
    backgroundImage: "/images/hero.jpg",
  },
  stats: [
    { value: "+50", label: "Empresas asesoradas" },
    { value: "100%", label: "Enfoque en cumplimiento" },
    { value: "360°", label: "Consultoría integral" },
    { value: "STPS", label: "Capacitación certificada" },
  ] satisfies StatItem[],
  services: {
    title: "Soluciones para tu empresa",
    subtitle:
      "Cubrimos las áreas clave del capital humano para que tu organización opere con seguridad, eficiencia y tranquilidad legal.",
    items: [
      {
        title: "Capital humano",
        description:
          "Estructura organizacional, reclutamiento, evaluación de desempeño y desarrollo del talento.",
        href: "/servicios",
      },
      {
        title: "Capacitación",
        description:
          "Programas de formación alineados a normativa STPS y necesidades reales de tu equipo.",
        href: "/servicios",
      },
      {
        title: "Cumplimiento",
        description:
          "Seguridad e higiene, cumplimiento laboral y acompañamiento ante auditorías y requisitos legales.",
        href: "/servicios",
      },
    ] satisfies ServiceItem[],
  },
  about: {
    title: "Empoderando empresas con estrategia y acompañamiento",
    description:
      "En Gestiona Capital Humano combinamos experiencia práctica, conocimiento normativo y un enfoque cercano. No solo entregamos documentos: te ayudamos a construir procesos sólidos que fortalezcan a tu equipo y protejan a tu empresa.",
    highlights: [
      "Diagnóstico personalizado para cada organización",
      "Capacitaciones presenciales y en línea",
      "Seguimiento continuo post-implementación",
    ],
  },
  video: {
    title: "Conoce cómo trabajamos",
    description:
      "Descubre nuestra metodología de acompañamiento en capacitación y consultoría empresarial.",
    posterImage: "/images/video-poster.jpg",
    embedUrl: "",
  },
  partners: {
    title: "Aliados estratégicos",
    subtitle: "Colaboramos con organizaciones que comparten nuestro compromiso con la excelencia.",
    items: [
      { name: "Desierto Solar" },
      { name: "STPS" },
      { name: "Hotel Casa Marías" },
      { name: "Guaymas Protein" },
      { name: "CONOCER" },
      { name: "Proethic" },
    ] satisfies Partner[],
  },
  cta: {
    title: "¿Listo para fortalecer tu capital humano?",
    description:
      "Agenda una asesoría sin compromiso y descubre cómo podemos apoyar a tu empresa.",
    primaryLabel: "Contactar ahora",
    primaryHref: "/contacto",
    secondaryLabel: "Escríbenos por WhatsApp",
  },
} as const;
