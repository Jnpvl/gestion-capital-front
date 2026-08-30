export const seoConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gestionach.com",
  defaultTitle: "Gestiona Capital Humano",
  titleTemplate: "%s | Gestiona Capital Humano",
  defaultDescription:
    "Consultoría en capital humano, capacitación laboral, seguridad e higiene y cumplimiento normativo en Guaymas, Sonora. Asesoría para empresas que buscan desarrollar su talento.",
  keywords: [
    "capital humano",
    "recursos humanos",
    "capacitación laboral",
    "cumplimiento normativo",
    "seguridad e higiene",
    "consultoría RH",
    "Guaymas",
    "Sonora",
    "STPS",
    "desarrollo organizacional",
  ],
  locale: "es_MX",
  twitterHandle: "@gestionach",
} as const;
