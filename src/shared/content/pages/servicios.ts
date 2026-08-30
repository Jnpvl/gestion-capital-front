export interface DetailedService {
  title: string;
  description: string;
  items: string[];
}

export const serviciosContent = {
  meta: {
    title: "Servicios",
    description:
      "Consultoría en capital humano, capacitación STPS, seguridad e higiene y cumplimiento normativo para empresas en Sonora.",
  },
  hero: {
    label: "Nuestros servicios",
    title: "Soluciones integrales para tu organización",
    description:
      "Diseñamos e implementamos servicios de consultoría y capacitación que fortalecen a tu equipo, reducen riesgos y mejoran el desempeño de tu empresa.",
  },
  categories: [
    {
      title: "Capital humano",
      description:
        "Estructuramos y optimizamos la gestión del talento en tu organización, desde el reclutamiento hasta el desarrollo del personal.",
      items: [
        "Diagnóstico organizacional y de estructura",
        "Descripciones de puesto y perfiles de cargo",
        "Reclutamiento y selección de personal",
        "Evaluación de desempeño",
        "Planes de carrera y sucesión",
        "Clima y cultura organizacional",
        "Manual de organización y políticas internas",
      ],
    },
    {
      title: "Capacitación y formación",
      description:
        "Programas de capacitación alineados a la normativa de la STPS y a las necesidades reales de tu equipo de trabajo.",
      items: [
        "Identificación de necesidades de capacitación (DNC)",
        "Cursos y talleres presenciales u online",
        "Constancias DC-3 y registro ante la STPS",
        "Capacitación en liderazgo y habilidades blandas",
        "Inducción y reinducción de personal",
        "Programas de formación continua",
      ],
    },
    {
      title: "Seguridad e higiene",
      description:
        "Implementamos sistemas de seguridad y salud en el trabajo que protegen a tu equipo y cumplen con la normativa vigente.",
      items: [
        "Diagnóstico de condiciones de seguridad e higiene",
        "Programa de seguridad y salud en el trabajo",
        "Análisis de riesgos y peligros",
        "Comité de seguridad e higiene",
        "Brigadas de emergencia, incendio y primeros auxilios",
        "Señalización y protocolos de seguridad",
      ],
    },
    {
      title: "Cumplimiento normativo",
      description:
        "Te acompañamos para operar con tranquilidad legal ante auditorías, inspecciones y requisitos de autoridades.",
      items: [
        "Cumplimiento de la Ley Federal del Trabajo",
        "Registro y actualización ante la STPS",
        "NOM-035: factores de riesgo psicosocial",
        "NOM-036 y NOM-037 (según aplique)",
        "Expediente único de cumplimiento",
        "Preparación para visitas de inspección",
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
