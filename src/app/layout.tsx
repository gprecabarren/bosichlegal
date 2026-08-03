import type { Metadata } from "next";
import localFont from "next/font/local";
import { getSiteContent, siteUrl } from "@/lib/content";
import { organizationSchema } from "@/lib/seo";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const serif = localFont({
  src: [
    { path: "./fonts/EBGaramond-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/EBGaramond-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-serif",
  display: "swap",
});

const sans = localFont({
  src: [
    { path: "./fonts/CabinetGrotesk-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const baseUrl = siteUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: content.seo.title,
      template: `%s | ${content.brand.name}`,
    },
    description: content.seo.description,
    keywords: content.seo.keywords,
    verification: content.seo.googleSiteVerification
      ? { google: content.seo.googleSiteVerification }
      : undefined,
    alternates: { canonical: "/" },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
        { url: "/favicon.ico", type: "image/x-icon", sizes: "32x32" },
      ],
      shortcut: ["/favicon.ico"],
      apple: [{ url: "/apple-icon.png", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url: baseUrl,
      siteName: content.brand.name,
      title: content.seo.title,
      description: content.seo.description,
      images: [{ url: "/assets/site/home-hero.png", width: 1920, height: 624 }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();

  return (
    <html lang="es-CL" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <SiteHeader content={content} />
        <main>{children}</main>
        <FloatingWhatsApp content={content} />
        <Footer content={content} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema(content)),
          }}
        />
      </body>
    </html>
  );
}
