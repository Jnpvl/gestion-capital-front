import type { Metadata } from "next";
import { Nom035PageView } from "@/presentation/components/pages";
import { createPageMetadata } from "@/shared/config/page-metadata";
import { nom035Content } from "@/shared/content";

export const metadata: Metadata = createPageMetadata(
  "/nom-035",
  nom035Content.meta.title,
  nom035Content.meta.description,
);

export default function Nom035Page() {
  return <Nom035PageView />;
}
