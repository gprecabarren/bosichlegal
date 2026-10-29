import { getSiteContent } from "@/lib/content";
import { ServicesEditor } from "../../ServicesEditor";
import { listAdminServicePages } from "@/lib/service-pages";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [content, pages] = await Promise.all([getSiteContent(), listAdminServicePages()]);
  return <ServicesEditor services={content.services} pages={pages} />;
}
