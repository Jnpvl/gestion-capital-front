import type { Metadata } from "next";
import { PoliticasPageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { POLITICAS_PATH, politicasContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  POLITICAS_PATH,
  politicasContent.meta.title,
  politicasContent.meta.description,
);

export default function PoliticasPage() {
  return <PoliticasPageView />;
}
