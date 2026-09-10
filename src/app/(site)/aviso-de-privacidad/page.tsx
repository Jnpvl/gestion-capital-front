import type { Metadata } from "next";
import { AvisoPrivacidadPageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { AVISO_PRIVACIDAD_PATH, avisoPrivacidadContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  AVISO_PRIVACIDAD_PATH,
  avisoPrivacidadContent.meta.title,
  avisoPrivacidadContent.meta.description,
);

export default function AvisoPrivacidadPage() {
  return <AvisoPrivacidadPageView />;
}
