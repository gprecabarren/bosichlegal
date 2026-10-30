import "server-only";
import { getSiteContent } from "@/lib/content";
import { canonicalUrl, pageSeo } from "@/lib/page-seo";
import { getPageSeo, getStaticPage } from "@/lib/page-content";

export async function staticPageSeo(input: Parameters<typeof pageSeo>[0]) {
  const content = await getSiteContent();
  const page = getStaticPage(input.path);
  if (!page) return pageSeo({ ...input, noindex: input.noindex || content.seo.noindexPaths?.includes(input.path) });
  const seo = getPageSeo(content, page.path);
  const metadata = pageSeo({ ...seo, path: page.path, noindex: Boolean(input.noindex || seo.noindex) });
  const url = canonicalUrl(seo.canonical);
  return {
    ...metadata,
    alternates: { canonical: url },
    openGraph: { ...metadata.openGraph, title: seo.ogTitle, description: seo.ogDescription, url },
    twitter: { ...metadata.twitter, title: seo.ogTitle, description: seo.ogDescription },
  };
}
