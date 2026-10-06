import type { Metadata, Viewport } from "next";
import { Anuphan, IBM_Plex_Sans_Thai, Instrument_Serif } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import { getLang } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Anuphan({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, lang] = await Promise.all([getSiteSettings(), getLang()]);
  const title = pick(settings, "seo_title", lang) || settings.site_name;
  const description = pick(settings, "seo_description", lang) || undefined;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s — ${settings.site_name}` },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: settings.site_name,
      title,
      description,
      locale: lang === "th" ? "th_TH" : "en_US",
      ...(settings.og_image_url ? { images: [settings.og_image_url] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, lang] = await Promise.all([getSiteSettings(), getLang()]);
  return (
    <html
      lang={lang}
      className={`${display.variable} ${body.variable} ${serif.variable}`}
      style={{ "--accent": settings.accent_color } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
