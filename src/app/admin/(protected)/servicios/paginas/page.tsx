import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { listAdminServicePages } from "@/lib/service-pages";

export default async function AdminServicePages() {
  const pages = await listAdminServicePages();
  return <section className="service-admin-pages"><Link className="back-link" href="/admin/servicios"><ArrowLeft size={16} />Tarjetas de servicios</Link><div className="editor-section-heading"><h2>Páginas de servicios</h2><Link className="button" href="/admin/servicios/paginas/nueva"><Plus size={18} />Nueva página</Link></div><div className="service-page-list">{pages.map(p => <article key={p.id}><div><span className="status-pill">{p.status === "published" ? "Publicado" : "Borrador"}{p.noindex ? " · No indexar" : " · Indexable"}</span><h3>{p.title}</h3><p>/servicios/{p.slug}</p></div><Link className="button button-secondary" href={`/admin/servicios/paginas/${p.id}`}><Pencil size={16} />Editar</Link></article>)}{!pages.length ? <p>No hay páginas de servicios creadas.</p> : null}</div></section>;
}
