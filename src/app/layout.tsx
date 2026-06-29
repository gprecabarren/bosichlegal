import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { getSiteContent, siteUrl } from "@/lib/content";
import { organizationSchema } from "@/lib/seo";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
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
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url: baseUrl,
      siteName: content.brand.name,
      title: content.seo.title,
      description: content.seo.description,
      images: [{ url: content.home.heroImage, width: 720, height: 706 }],
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
