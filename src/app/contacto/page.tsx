import type { Metadata } from "next";
import { ContactoPageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { contactoContent } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/contacto",
  contactoContent.meta.title,
  contactoContent.meta.description,
);

export default function ContactoPage() {
  return <ContactoPageView />;
}
