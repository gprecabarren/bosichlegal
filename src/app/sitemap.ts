import type { MetadataRoute } from "next";
import { getSiteContent, siteUrl } from "@/lib/content";
import { listNewsPosts } from "@/lib/news";
import { listPublicProperties } from "@/lib/properties";
import { locationPath } from "@/lib/property-fields";
import { listServicePages } from "@/lib/service-pages";
import { indexableServicePages } from "@/lib/service-fields";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/servicios", "/propiedades", "/noticias", "/ubicacion", "/sobre-nosotros", "/contacto"].map((path) => {
    const changeFrequency: "weekly" | "monthly" = path === "" ? "weekly" : "monthly";
    return {
      url: `${baseUrl}${path}`,
      changeFrequency,
      priority: path === "" ? 1 : 0.8,
    };
  });

  const newsRoutes = (await listNewsPosts()).filter((post) => !post.noindex).map((post) => ({
    url: `${baseUrl}/noticias/${post.slug}`,
    lastModified: post.updated_at || post.created_at || undefined,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const properties = await listPublicProperties();
  const propertyRoutes = properties.map((property) => ({ url: `${baseUrl}/propiedades/${property.slug}`, lastModified: new Date(property.updated_at), changeFrequency: "weekly" as const, priority: 0.75 }));
  const locations = new Map<string, Date>();
  for (const property of properties) {
    for (const path of [locationPath(property.region), locationPath(property.region, property.city)]) {
      const modified = new Date(property.updated_at);
      if (!locations.has(path) || locations.get(path)! < modified) locations.set(path, modified);
    }
  }
  const locationRoutes = [...locations].map(([path, lastModified]) => ({ url: `${baseUrl}${path}`, lastModified, changeFrequency: "weekly" as const, priority: 0.7 }));
  const serviceRoutes = indexableServicePages(await listServicePages()).map(page => ({ url: `${baseUrl}/servicios/${page.slug}`, lastModified: new Date(page.updated_at), changeFrequency: "monthly" as const, priority: 0.8 }));
  const blocked = new Set((await getSiteContent()).seo.noindexPaths || []);
  return [...staticRoutes, ...newsRoutes, ...propertyRoutes, ...locationRoutes, ...serviceRoutes].filter(route => !blocked.has(new URL(route.url).pathname));
}
