import type { Metadata } from "next";
import { SuscribetePageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { suscribeteContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/eventos/suscribete",
  suscribeteContent.meta.title,
  suscribeteContent.meta.description,
);

export default function SuscribetePage() {
  return <SuscribetePageView />;
}
