import { notFound } from "next/navigation";
import Link from "next/link";
import { PropertyDetails } from "@/components/PropertyDetails";
import { getAdminProperty } from "@/lib/properties";
import { getSiteContent } from "@/lib/content";

export default async function PropertyPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, content] = await Promise.all([getAdminProperty(id), getSiteContent()]);
  if (!property || property.deleted_at) notFound();
  return <><p className="admin-warning">Vista previa privada. <Link href={`/admin/propiedades/${id}`}>Volver a editar</Link></p><PropertyDetails property={property} content={content} /></>;
}
