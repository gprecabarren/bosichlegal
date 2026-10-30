import { getSiteContent } from "@/lib/content";
import { ServicesEditor } from "../../ServicesEditor";
import { listAdminServicePages } from "@/lib/service-pages";
import Link from "next/link";
import { Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const [content, pages] = await Promise.all([getSiteContent(), listAdminServicePages()]);
  return <><nav aria-label="Páginas individuales de servicios" className="admin-actions">{pages.map(page => <Link key={page.id} className="back-link" href={`/admin/servicios/paginas/${page.id}`}><Pencil size={16} />{page.title}</Link>)}</nav><ServicesEditor services={content.services} pages={pages} /></>;
}
