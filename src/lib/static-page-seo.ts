import "server-only";
import { getSiteContent } from "@/lib/content";
import { pageSeo } from "@/lib/page-seo";

export async function staticPageSeo(input: Parameters<typeof pageSeo>[0]) {
  const content = await getSiteContent();
  return pageSeo({ ...input, noindex: input.noindex || content.seo.noindexPaths?.includes(input.path) });
}
