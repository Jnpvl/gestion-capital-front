import type { Metadata } from "next";
import { seoConfig } from "@/shared/config/seo";

export function createPageMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  const url = `${seoConfig.siteUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${seoConfig.defaultTitle}`,
      description,
      url,
      siteName: seoConfig.defaultTitle,
      locale: seoConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${seoConfig.defaultTitle}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
