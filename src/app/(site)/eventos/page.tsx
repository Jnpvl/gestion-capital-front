import type { Metadata } from "next";
import { EventosPageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { eventosContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/eventos",
  eventosContent.meta.title,
  eventosContent.meta.description,
);

export default function EventosPage() {
  return <EventosPageView />;
}
