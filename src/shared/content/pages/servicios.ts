export interface DetailedService {
  title: string;
  description: string;
  items: string[];
}

export const serviciosContent = {
  meta: {
    title: "Servicios",
    description:
      "Soluciones integrales de consultoría y capacitación en capital humano, seguridad e higiene, cumplimiento normativo, estándares y certificaciones.",
  },
  hero: {
    label: "Nuestros servicios",
    title: "Soluciones integrales para organizaciones y profesionales",
    description:
      "Diseñamos e implementamos soluciones de consultoría y capacitación en Capital Humano, Seguridad e Higiene, cumplimiento con la legislación mexicana, estándares y certificaciones. Fortalecemos personas, equipos y organizaciones, ayudándoles a desarrollar competencias, mejorar procesos, reducir riesgos y alcanzar sus objetivos.",
  },
  categories: [
    {
      title: "Capital Humano",
      description:
        "Estructuramos y fortalecemos la gestión del talento para mejorar procesos, equipos y resultados.",
      items: [
        "Diagnóstico organizacional y de estructura",
        "Descripciones y perfiles de puesto",
        "Reclutamiento y selección",
        "Evaluación de desempeño",
        "Planes de carrera y sucesión",
        "Clima y cultura organizacional",
        "Manuales, políticas y procesos internos",
      ],
    },
    {
      title: "Capacitación y Formación",
      description:
        "Desarrollamos competencias mediante programas presenciales y virtuales, adaptados a las necesidades de organizaciones y profesionales.",
      items: [
        "Detección de Necesidades de Capacitación (DNC)",
        "Cursos y talleres presenciales y virtuales",
        "Capacitación presencial, sincrónica y asincrónica",
        "Constancias DC-3 y constancias con valor curricular",
        "Liderazgo y habilidades blandas",
        "Formación y actualización profesional",
      ],
    },
    {
      title: "Seguridad e Higiene",
      description:
        "Ayudamos a las organizaciones a fortalecer la prevención de riesgos y el cumplimiento de las disposiciones aplicables en seguridad y salud laboral.",
      items: [
        "Diagnóstico de condiciones de seguridad e higiene",
        "Programas de seguridad y salud en el trabajo",
        "Identificación de peligros y evaluación de riesgos",
        "Comisiones de Seguridad e Higiene",
        "Brigadas y capacitación para emergencias",
        "Señalización y protocolos de seguridad",
      ],
    },
    {
      title: "Cumplimiento, Estándares y Certificaciones",
      description:
        "Acompañamos a las organizaciones en el cumplimiento de la legislación mexicana, requisitos legales, estándares y procesos de certificación.",
      items: [
        "Cumplimiento de la Ley Federal del Trabajo",
        "Implementación de NOM aplicables",
        "Diagnóstico y cierre de brechas de cumplimiento",
        "Preparación y acompañamiento ante auditorías",
        "Implementación de estándares y certificaciones",
        "Integración de expedientes y evidencias de cumplimiento",
      ],
    },
  ] satisfies DetailedService[],
  process: {
    title: "¿Cómo trabajamos?",
    steps: [
      {
        step: "01",
        title: "Diagnóstico",
        description: "Conocemos tu empresa, identificamos brechas y priorizamos acciones.",
      },
      {
        step: "02",
        title: "Propuesta",
        description: "Diseñamos un plan a la medida con alcance, tiempos y entregables claros.",
      },
      {
        step: "03",
        title: "Implementación",
        description: "Ejecutamos capacitaciones, documentación y acompañamiento en campo.",
      },
      {
        step: "04",
        title: "Seguimiento",
        description: "Verificamos resultados y damos soporte continuo post-implementación.",
      },
    ],
  },
} as const;
