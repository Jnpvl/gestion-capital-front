export interface EventItem {
  title: string;
  date: string;
  type: string;
  description: string;
  modality: string;
}

export const eventosContent = {
  meta: {
    title: "Eventos",
    description:
      "Capacitaciones, talleres y eventos de Gestiona Capital Humano sobre gestión del talento y cumplimiento laboral.",
  },
  hero: {
    label: "Eventos y capacitaciones",
    title: "Aprende, conecta y actualízate",
    description:
      "Participa en nuestros talleres, conferencias y programas de capacitación diseñados para líderes, responsables de RH y empresarios.",
  },
  upcoming: [
    {
      title: "Factores de riesgo psicosocial (NOM-035)",
      date: "Próximamente",
      type: "Capacitación",
      description:
        "Taller práctico sobre identificación, prevención y cumplimiento de la NOM-035 en materia de riesgos psicosociales en el centro de trabajo.",
      modality: "Presencial / Híbrido",
    },
    {
      title: "Liderazgo y gestión de equipos",
      date: "Próximamente",
      type: "Taller",
      description:
        "Desarrolla habilidades de liderazgo efectivo, comunicación y motivación de equipos de alto rendimiento.",
      modality: "Presencial",
    },
    {
      title: "Cumplimiento STPS para PyMEs",
      date: "Próximamente",
      type: "Conferencia",
      description:
        "Sesión informativa sobre los requisitos esenciales de cumplimiento laboral para pequeñas y medianas empresas.",
      modality: "En línea",
    },
  ] satisfies EventItem[],
  subscribe: {
    title: "¿Quieres enterarte primero?",
    description:
      "Suscríbete para recibir información sobre próximos eventos, capacitaciones y recursos sobre gestión del talento.",
    ctaLabel: "Suscribirme",
    ctaHref: "/eventos/suscribete",
  },
} as const;

export const suscribeteContent = {
  meta: {
    title: "Suscríbete",
    description:
      "Recibe información, recursos, capacitaciones y eventos sobre gestión del talento y cumplimiento laboral.",
  },
  hero: {
    label: "Newsletter",
    title: "Mantente informado",
    description:
      "¿Quieres recibir información, recursos, capacitaciones y eventos sobre gestión del talento, cumplimiento laboral y desarrollo organizacional?",
  },
  benefits: [
    "Aviso de próximos eventos y talleres",
    "Recursos y guías sobre cumplimiento laboral",
    "Tips de gestión de capital humano",
    "Promociones exclusivas en capacitaciones",
  ],
} as const;
