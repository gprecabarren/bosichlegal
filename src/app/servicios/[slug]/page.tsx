import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/ServiceDetail";
import { getSiteContent } from "@/lib/content";
import { getPublicServicePage, listServicePages } from "@/lib/service-pages";
import { pageSeo } from "@/lib/page-seo";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicServicePage(slug);
  if (!p) return { title: "Servicio no encontrado", robots: { index: false, follow: false } };
  const description = p.meta_description || p.content.intro.slice(0, 160);
  return { ...pageSeo({ title: p.seo_title || p.title, description, path: `/servicios/${p.slug}`, image: p.content.heroImage, imageAlt: p.content.heroAlt, noindex: p.noindex }),
    alternates: { canonical: `/servicios/${p.slug}` }, robots: { index: !p.noindex, follow: true },
    openGraph: { type: "website", locale: "es_CL", url: `/servicios/${p.slug}`, title: p.og_title || p.seo_title || p.title, description: p.og_description || description, images: [{ url: p.content.heroImage, alt: p.content.heroAlt }] },
    twitter: { card: "summary_large_image", title: p.og_title || p.seo_title || p.title, description: p.og_description || description, images: [p.content.heroImage] } };
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [page, content, pages] = await Promise.all([getPublicServicePage(slug), getSiteContent(), listServicePages()]);
  if (!page) notFound();
  return <ServiceDetail page={page} content={content} pages={pages} />;
}
