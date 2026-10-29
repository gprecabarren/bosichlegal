import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetails } from "@/components/PropertyDetails";
import { getSiteContent } from "@/lib/content";
import { getPublicProperty } from "@/lib/properties";
import { pageSeo } from "@/lib/page-seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getPublicProperty((await params).slug);
  if (!property) return { title: "Propiedad no encontrada", robots: { index: false } };
  const title = property.seo_title || `${property.title} en ${property.city}`;
  const description = property.meta_description || property.description.replace(/\s+/g, " ").slice(0, 160);
  return pageSeo({ title, description, path: `/propiedades/${property.slug}`, image: property.images[0]?.url, imageAlt: property.images[0]?.alt || property.title });
}

export default async function PropertyDetailPage({ params }: Props) {
  const [property, content] = await Promise.all([getPublicProperty((await params).slug), getSiteContent()]);
  if (!property) notFound();
  return <PropertyDetails property={property} content={content} />;
}
