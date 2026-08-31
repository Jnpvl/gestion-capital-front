export interface Partner {
  name: string;
  description?: string;
  logo?: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  href: string;
}

export interface StatItem {
  value: string;
  label?: string;
  detail?: string;
}

export const homeContent = {
  hero: {
    eyebrow: "Guaymas, Sonora · Capital humano",
    headlineHighlight: "Impulsa",
    headlineRest: "el talento y el cumplimiento de tu organización",
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
    { value: "STPS", detail: "Agentes Capacitadores Externos registrados" },
    {
      value: "CONOCER",
      detail: "Instructores expertos en la materia y certificados en CONOCER",
    },
  ] satisfies StatItem[],
  services: {
    title: "Soluciones para ti y tu empresa",
    subtitle:
      "Cubrimos las áreas clave del capital humano para que tu organización opere con seguridad, eficiencia y tranquilidad legal.",
    items: [
      {
        title: "Capital humano",
        description:
          "Acompañamos a las organizaciones en la mejora de sus procesos, cultura y gestión de personas, alineando el talento con los objetivos y necesidades de cada empresa.",
        href: "/servicios",
      },
      {
        title: "Capacitación",
        description:
          "Diseñamos e impartimos programas de capacitación para empresas y profesionales, alineados con las necesidades de cada organización, legislación laboral, normativa aplicable y los estándares de competencia.",
        href: "/servicios",
      },
      {
        title: "Cumplimiento",
        description:
          "Acompañamos a empresas y profesionales en el cumplimiento de sus obligaciones laborales, requisitos de la STPS, estándares y certificaciones, fortaleciendo sus procesos para responder eficazmente ante auditorías y evaluaciones.",
        href: "/servicios",
      },
    ] satisfies ServiceItem[],
  },
  about: {
    title: "Empoderando empresas con estrategia y acompañamiento",
    paragraphs: [
      "En Gestiona Capital Humano combinamos experiencia práctica, conocimiento normativo y un enfoque cercano. No solo entregamos documentos: te ayudamos a construir procesos sólidos que fortalezcan a tu equipo y protejan a tu empresa.",
      "Trabajamos bajo una metodología flexible y personalizada, adaptándonos a las necesidades de cada organización y profesional mediante acompañamiento 1 a 1, sesiones sincrónicas y asincrónicas, coaching y espacios de aprendizaje colaborativo.",
      "Más que brindar soluciones aisladas, buscamos crear comunidad, compartir conocimiento y generar relaciones de acompañamiento a largo plazo, para que cada proceso se traduzca en aprendizaje, desarrollo y resultados sostenibles.",
    ],
  },
  video: {
    title: "Conoce cómo trabajamos",
    description:
      "Descubre nuestra metodología de acompañamiento en capacitación y consultoría empresarial.",
    /** Video local del sitio: coloca el archivo en public/videos/ (ej. nosotros.mp4) */
    src: "/videos/nosotros.mp4",
    embedUrl: "",
  },
  partners: {
    allies: {
      title: "Aliados estratégicos",
      subtitle: "Submarcas y socios con los que compartimos visión y complementamos nuestra oferta.",
      items: [
        {
          name: "Proethic",
          logo: "/images/aliados/proethic.png",
          description:
            "Cursos con enfoque social y ambiental, con contenidos de seguridad y responsabilidad organizacional.",
        },
        {
          name: "Desierto Solar",
          logo: "/images/aliados/desierto-solar.png",
          description:
            "Especialistas en electricidad y paneles solares, con programas de formación en energía y temas técnicos relacionados.",
        },
        {
          name: "ASLA",
          logo: "/images/aliados/asla.png",
          description:
            "Seguridad e higiene y asesoría especializada para fortalecer la prevención de riesgos en el trabajo.",
        },
      ] satisfies Partner[],
    },
    clients: {
      title: "Clientes",
      subtitle: "Organizaciones que han confiado en nuestro acompañamiento.",
      items: [
        { name: "Hotel Casa Marías", logo: "/images/clientes/hotel-casa-marias.png" },
        { name: "Velvet", logo: "/images/clientes/velvet.png" },
        { name: "Desierto Solar", logo: "/images/clientes/desierto-solar.png" },
        { name: "Guaymas Protein Company", logo: "/images/clientes/guaymas-protein-company.png" },
      ] satisfies Partner[],
    },
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
