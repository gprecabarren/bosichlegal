import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/ServiceDetail";
import { getSiteContent } from "@/lib/content";
import { getAdminServicePage, listServicePages } from "@/lib/service-pages";

export default async function ServicePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page, content, pages] = await Promise.all([getAdminServicePage(id), getSiteContent(), listServicePages()]);
  if (!page || page.deleted_at) notFound();
  return <><p className="admin-help">Vista previa privada. <Link href={`/admin/servicios/paginas/${id}`}>Volver a editar</Link></p><ServiceDetail page={page} content={content} pages={pages} /></>;
}
