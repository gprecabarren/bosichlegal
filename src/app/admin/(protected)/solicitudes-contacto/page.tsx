import { AdminContacts } from "../../AdminContacts";
import { listContactSubmissions } from "@/lib/contact-submissions";

export const dynamic = "force-dynamic";

export default async function ContactRequestsPage({ searchParams }: { searchParams: Promise<{ page?: string; trashPage?: string }> }) {
  const params = await searchParams;
  try {
    const [active, trash] = await Promise.all([
      listContactSubmissions({ page: Number(params.page || 1) }),
      listContactSubmissions({ trashed: true, page: Number(params.trashPage || 1) }),
    ]);
    return <AdminContacts active={active} trash={trash} />;
  } catch {
    return <p className="admin-warning" role="alert">No se pudieron cargar las solicitudes y su papelera. Revisa la conexión y la migración de la papelera.</p>;
  }
}
