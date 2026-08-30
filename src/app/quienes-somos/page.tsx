import type { Metadata } from "next";
import { QuienesSomosPageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { quienesSomosContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/quienes-somos",
  quienesSomosContent.meta.title,
  quienesSomosContent.meta.description,
);

export default function QuienesSomosPage() {
  return <QuienesSomosPageView />;
}
