import type { Metadata } from "next";
import localFont from "next/font/local";
import { seoConfig } from "@/shared/config/seo";
import "./globals.css";

const lato = localFont({
  variable: "--font-lato",
  display: "swap",
  src: [
    { path: "./fonts/lato-300.ttf", weight: "300", style: "normal" },
    { path: "./fonts/lato-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/lato-700.ttf", weight: "700", style: "normal" },
  ],
});

const plusJakarta = localFont({
  variable: "--font-plus-jakarta",
  display: "swap",
  src: [
    { path: "./fonts/plus-jakarta-sans-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-800.ttf", weight: "800", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  keywords: [...seoConfig.keywords],
  authors: [{ name: seoConfig.defaultTitle }],
  creator: seoConfig.defaultTitle,
  formatDetection: {
    email: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${lato.variable} ${plusJakarta.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
