import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCatalog } from "@/components/PropertyCatalog";
import { listPublicProperties } from "@/lib/properties";
import { locationPath, regionName, regions, slugify } from "@/lib/property-fields";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ location: string[] }> };

async function locationData(params: Props["params"]) {
  const { location } = await params;
  if (location.length > 2 || !regions.some(({ id }) => id === location[0])) notFound();
  const [region, citySlug] = location;
  const properties = await listPublicProperties();
  const matching = properties.filter((property) => property.region === region && (!citySlug || slugify(property.city) === citySlug));
  if (!matching.length) notFound();
  return { properties, region, city: citySlug ? matching[0].city : undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, city } = await locationData(params);
  const place = city ? `${city}, ${regionName(region)}` : regionName(region);
  return { title: `Propiedades en venta en ${place}`, description: `Propiedades en venta en ${place}. Consulta fotos, precios y características con Bosich Legal.`, alternates: { canonical: locationPath(region, city) } };
}

export default async function PropertyLocationPage({ params }: Props) {
  const { properties, region, city } = await locationData(params);
  return <><header className="property-index-heading"><Link className="back-link" href="/propiedades">Todas las propiedades</Link><p className="eyebrow">Propiedades en venta</p><h1>{city || regionName(region)}</h1>{city ? <p>{regionName(region)}</p> : null}</header><PropertyCatalog properties={properties} selected={{ region, city }} /></>;
}
