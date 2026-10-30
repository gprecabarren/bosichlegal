import type { Metadata } from "next";
import { PropertyCatalog } from "@/components/PropertyCatalog";
import { listPublicProperties } from "@/lib/properties";
import { staticPageSeo } from "@/lib/static-page-seo";
import { getSiteContent } from "@/lib/content";
import { getPageContent } from "@/lib/page-content";

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
  const [properties, query, content] = await Promise.all([listPublicProperties(), searchParams, getSiteContent()]);
  const { text, values } = getPageContent(content, "/propiedades");
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  return <><header className="property-index-heading"><p className="eyebrow">{text("eyebrow")}</p><h1>{text("title")}</h1><p>{text("description")}</p></header>
    <PropertyCatalog properties={properties} copy={values} selected={{ region: value("region"), city: value("city"), type: value("type"), status: value("status") }} />
  </>;
}
