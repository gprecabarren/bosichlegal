import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { listAdminServicePages } from "@/lib/service-pages";
import { ServicePageList } from "@/app/admin/ServicePageList";

export default async function AdminServicePages({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const trash = (await searchParams).view === "trash";
  const [activePages, deletedPages] = await Promise.all([listAdminServicePages(), listAdminServicePages("trash")]);
  return <section className="service-admin-pages"><Link className="back-link" href="/admin/servicios"><ArrowLeft size={16} />Tarjetas de servicios</Link><div className="editor-section-heading"><h2>Páginas de servicios</h2><Link className="button" href="/admin/servicios/paginas/nueva"><Plus size={18} />Nueva página</Link></div>
    <nav className="admin-actions" aria-label="Estado de páginas"><Link className={trash ? "button button-secondary" : "button"} href="/admin/servicios/paginas" aria-current={!trash ? "page" : undefined}>Vigentes ({activePages.length})</Link><Link className={trash ? "button" : "button button-secondary"} href="/admin/servicios/paginas?view=trash" aria-current={trash ? "page" : undefined}><Trash2 size={16} />Papelera ({deletedPages.length})</Link></nav>
    <ServicePageList key={trash ? "trash" : "active"} pages={trash ? deletedPages : activePages} trash={trash} />
  </section>;
}
