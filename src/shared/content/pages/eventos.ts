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
      "Capacitaciones, talleres y eventos de Gestiona Capital Humano sobre capital humano, cumplimiento y desarrollo organizacional.",
  },
  hero: {
    label: "Eventos y capacitación",
    title: "Aprende, conecta y mantente actualizado",
    description:
      "Creamos espacios de formación, actualización e intercambio de conocimientos dirigidos a profesionales, líderes, emprendedores y organizaciones que buscan fortalecer sus competencias y mantenerse al día en temas de Capital Humano, cumplimiento y desarrollo organizacional.",
  },
  upcoming: [
    {
      title: "Factores de Riesgo Psicosocial — NOM-035",
      date: "Próximamente",
      type: "Capacitación",
      description:
        "Programa práctico orientado a comprender, identificar y atender los factores de riesgo psicosocial, así como fortalecer el cumplimiento de las disposiciones aplicables de la NOM-035-STPS.",
      modality: "Presencial / Híbrido",
    },
    {
      title: "Liderazgo y Gestión de Equipos",
      date: "Próximamente",
      type: "Taller",
      description:
        "Desarrolla competencias para liderar equipos de manera efectiva, fortaleciendo la comunicación, la colaboración, la toma de decisiones y el desempeño.",
      modality: "Presencial / En línea",
    },
    {
      title: "Cumplimiento Laboral y STPS",
      date: "Próximamente",
      type: "Conferencia",
      description:
        "Conoce los principales requerimientos de la legislación laboral mexicana y las obligaciones aplicables ante la STPS, con un enfoque práctico para facilitar su comprensión e implementación.",
      modality: "En línea",
    },
  ] satisfies EventItem[],
  subscribe: {
    title: "¿Quieres mantenerte actualizado?",
    description:
      "Recibe información sobre próximos cursos, talleres, conferencias, eventos y recursos de formación.",
    communityTitle: "Forma parte de nuestra comunidad",
    communityDescription:
      "Aprende, conecta y desarrolla nuevas competencias junto a otros profesionales.",
    ctaLabel: "Suscribirme",
    ctaHref: "/eventos/suscribete",
  },
} as const;

export const suscribeteContent = {
  meta: {
    title: "Suscríbete",
    description:
      "Recibe información sobre cursos, talleres, conferencias, eventos y recursos de formación en capital humano y cumplimiento.",
  },
  hero: {
    label: "Newsletter",
    title: "Mantente informado",
    description:
      "Recibe información sobre próximos cursos, talleres, conferencias, eventos y recursos de formación. Forma parte de nuestra comunidad y desarrolla nuevas competencias junto a otros profesionales.",
  },
  benefits: [
    "Aviso de próximos cursos, talleres y eventos",
    "Recursos y guías sobre cumplimiento laboral",
    "Tips de gestión de capital humano",
    "Promociones exclusivas en capacitaciones",
  ],
} as const;
