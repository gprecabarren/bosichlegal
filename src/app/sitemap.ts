import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";
import { listNewsPosts } from "@/lib/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/servicios", "/noticias", "/ubicacion", "/sobre-nosotros", "/contacto"].map((path) => {
    const changeFrequency: "weekly" | "monthly" = path === "" ? "weekly" : "monthly";
    return {
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority: path === "" ? 1 : 0.8,
    };
  });

  const newsRoutes = (await listNewsPosts()).map((post) => ({
    url: `${baseUrl}/noticias/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  return [...staticRoutes, ...newsRoutes];
}
