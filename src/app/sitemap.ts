import type { MetadataRoute } from "next";
import { seoConfig } from "@/shared/config/seo";

const routes = [
  "",
  "/quienes-somos",
  "/servicios",
  "/eventos",
  "/eventos/suscribete",
  "/contacto",
  "/por-que-elegirnos",
  "/aviso-de-privacidad",
  "/politicas",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${seoConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
