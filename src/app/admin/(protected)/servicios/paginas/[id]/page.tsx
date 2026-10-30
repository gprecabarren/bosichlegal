import { notFound } from "next/navigation";
import { ServicePageEditor } from "@/app/admin/ServicePageEditor";
import { getAdminServicePage, listAdminServicePages } from "@/lib/service-pages";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [page, pages] = await Promise.all([getAdminServicePage(id), listAdminServicePages()]);
  if (!page || page.deleted_at) notFound();
  return <ServicePageEditor page={page} pages={pages} />;
}
