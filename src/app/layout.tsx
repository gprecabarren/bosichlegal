import type { Metadata } from "next";
import localFont from "next/font/local";
import { getSiteContent, siteUrl } from "@/lib/content";
import { organizationSchema } from "@/lib/seo";
import { jsonLd } from "@/lib/page-seo";
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
    verification: { google: content.seo.googleSiteVerification || "iyThj2ILNOuK9MDViiMRJ25PQif_SIVwxajZC7WYL-Y" },
    alternates: { canonical: "/" },
    icons: {
      icon: [
        { url: "/favicon.svg?v=chess-20261029", type: "image/svg+xml", sizes: "any" },
        { url: "/favicon.ico?v=chess-20261029", type: "image/x-icon", sizes: "32x32" },
      ],
      shortcut: ["/favicon.ico?v=chess-20261029"],
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
      <head>
        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M2NJN993');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M2NJN993"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <SiteHeader content={content} />
        <main>{children}</main>
        <FloatingWhatsApp content={content} />
        <Footer content={content} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(organizationSchema(content, siteUrl())),
          }}
        />
      </body>
    </html>
  );
}
