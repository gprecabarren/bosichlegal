import { notFound } from "next/navigation";
import { getAdminProperty } from "@/lib/properties";
import { PropertyEditor } from "../../../PropertyEditor";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const property = await getAdminProperty((await params).id);
  if (!property || property.deleted_at) notFound();
  return <PropertyEditor property={property} />;
}
