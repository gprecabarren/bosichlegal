import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content";
import { getStaticPage } from "@/lib/page-content";
import { StaticPageEditor } from "../../../StaticPageEditor";

export default async function AdminStaticPage({ params }: { params: Promise<{ id: string }> }) {
  const page = getStaticPage((await params).id);
  if (!page) notFound();
  return <StaticPageEditor pageId={page.id} content={await getSiteContent()} />;
}
