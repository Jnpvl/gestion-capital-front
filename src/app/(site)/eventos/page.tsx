import type { Metadata } from "next";
import { EventosPageView } from "@/presentation/components/pages";
import { fetchPublicEvents } from "@/infrastructure/http/events-public-api";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { eventosContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/eventos",
  eventosContent.meta.title,
  eventosContent.meta.description,
);

export default async function EventosPage() {
  const events = await fetchPublicEvents();
  return <EventosPageView events={events} />;
}
