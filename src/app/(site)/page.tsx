import type { Metadata } from "next";
import {
  AboutSection,
  CtaSection,
  FeaturedCoursesSection,
  HeroSection,
  PartnersSection,
  ServicesSection,
} from "@/presentation/components/home";
import { JsonLd } from "@/presentation/components/seo/json-ld";
import { homeContent } from "@/shared/content";
import { seoConfig } from "@/shared/config/seo";

const title = "Asesoría en Capital Humano y Capacitación Laboral";
const description = homeContent.hero.subheadline;

export const metadata: Metadata = {
  title,
  description,
  keywords: [...seoConfig.keywords],
  alternates: {
    canonical: seoConfig.siteUrl,
  },
  openGraph: {
    title: `${title} | ${seoConfig.defaultTitle}`,
    description,
    url: seoConfig.siteUrl,
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

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <HeroSection />
      <ServicesSection />
      <FeaturedCoursesSection />
      <AboutSection />
      <PartnersSection />
      <CtaSection />
    </>
  );
}
