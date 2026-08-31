import type { Metadata } from "next";
import { PorQueElegirnosPageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { porQueElegirnosContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/por-que-elegirnos",
  porQueElegirnosContent.meta.title,
  porQueElegirnosContent.meta.description,
);

export default function PorQueElegirnosPage() {
  return <PorQueElegirnosPageView />;
}
