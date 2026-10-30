import Link from "next/link";
import { ExternalLink, Pencil, Scale } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { getPageSeo, staticPages } from "@/lib/page-content";

export default async function AdminPagesPage() {
  const content = await getSiteContent();
  return <section className="admin-pages"><div className="editor-section-heading"><h2>Páginas y SEO</h2><Link className="button button-secondary" href="/admin/servicios/paginas"><Scale size={18} />Páginas de servicios</Link></div>
    <div className="static-page-list">{staticPages.map(page => <article key={page.id}><div><h3>{page.label}</h3><p>{page.path}</p><span className="status-pill">{getPageSeo(content, page.path).noindex ? "No indexar" : "Indexación permitida"}</span></div><div className="admin-trash-actions"><Link className="button button-secondary" href={`/admin/paginas/${page.id}`}><Pencil size={16} />Editar textos y SEO</Link><Link className="back-link" href={page.path} target="_blank" rel="noreferrer"><ExternalLink size={16} />Ver página</Link></div></article>)}</div>
  </section>;
}
