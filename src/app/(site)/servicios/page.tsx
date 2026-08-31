import type { Metadata } from "next";
import { ServiciosPageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { serviciosContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/servicios",
  serviciosContent.meta.title,
  serviciosContent.meta.description,
);

export default function ServiciosPage() {
  return <ServiciosPageView />;
}
