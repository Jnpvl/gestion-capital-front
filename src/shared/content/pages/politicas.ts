export const POLITICAS_PATH = "/politicas";

type PoliticasSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  closing?: string;
};

export const politicasContent: {
  meta: { title: string; description: string };
  hero: { label: string; title: string; description: string };
  lastUpdated: string;
  sections: PoliticasSection[];
} = {
  meta: {
    title: "Políticas",
    description:
      "Políticas de uso y condiciones de Gestiona Capital Humano para el sitio y la plataforma de cursos.",
  },
  hero: {
    label: "Legal",
    title: "Políticas",
    description:
      "Aquí publicamos las políticas aplicables al uso del sitio y de nuestros servicios.",
  },
  lastUpdated: "Pendiente de publicación",
  sections: [
    {
      title: "Contenido en preparación",
      paragraphs: [
        "Esta página está lista para publicar las políticas de Gestiona Capital Humano. En cuanto nos compartas el texto final, lo cargamos aquí.",
      ],
    },
  ],
};
