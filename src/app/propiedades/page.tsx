import type { Metadata } from "next";
import { PropertyCatalog } from "@/components/PropertyCatalog";
import { listPublicProperties } from "@/lib/properties";
import { staticPageSeo } from "@/lib/static-page-seo";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await searchParams;
  return staticPageSeo({
    title: "Propiedades en venta",
    description: "Propiedades en venta con Bosich Legal. Revisa fotografías, características, precios y ubicaciones por ciudad y región en Chile.",
    path: "/propiedades", noindex: ["region", "city", "type", "status"].some(key => Boolean(query[key])),
  });
}

export default async function PropertiesPage({ searchParams }: Props) {
  const [properties, query] = await Promise.all([listPublicProperties(), searchParams]);
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  return <><header className="property-index-heading"><p className="eyebrow">Bosich Legal</p><h1>Propiedades en venta</h1><p>Encuentra tu próxima propiedad.</p></header>
    <PropertyCatalog properties={properties} selected={{ region: value("region"), city: value("city"), type: value("type"), status: value("status") }} />
  </>;
}
