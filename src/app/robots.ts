import type { MetadataRoute } from "next";
import { seoConfig } from "@/shared/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  };
}
