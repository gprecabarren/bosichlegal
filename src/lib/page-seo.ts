import type { Metadata } from "next";

export const canonicalOrigin = "https://www.bosichlegal.cl";

export function canonicalUrl(value: string) {
  const url = new URL(value, canonicalOrigin);
  if (["bosichlegal.cl", "www.bosichlegal.cl"].includes(url.hostname)) {
    url.protocol = "https:";
    url.hostname = "www.bosichlegal.cl";
    url.port = "";
    url.search = "";
    url.hash = "";
  }
  return url.href;
}

export function pageSeo({ title, description, path, image = "/assets/site/home-hero.png", imageAlt = "Bosich Legal, estudio jurídico", noindex = false }: {
  title: string; description: string; path: string; image?: string; imageAlt?: string; noindex?: boolean;
}): Metadata {
  const url = canonicalUrl(path);
  return {
    title: { absolute: title.includes("Bosich Legal") ? title : `${title} | Bosich Legal` },
    description, alternates: { canonical: url }, robots: { index: !noindex, follow: true },
    openGraph: { type: "website", locale: "es_CL", siteName: "Bosich Legal", title, description, url, images: [{ url: image, alt: imageAlt }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
