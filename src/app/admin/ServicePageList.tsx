"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ExternalLink, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { ServicePageSummary } from "@/types/service";
import { changeServicePageLifecycleAction } from "./service-page-actions";
import styles from "./ServicePageList.module.css";

const dateFormat = new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeZone: "America/Santiago" });

export function ServicePageList({ pages, trash }: { pages: ServicePageSummary[]; trash: boolean }) {
  const [state, action, pending] = useActionState(changeServicePageLifecycleAction, null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const visible = pages.filter(page => (status === "all" || page.status === status)
    && `${page.title} ${page.slug}`.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")));
  return <>
    <div className={styles.filters}>
      <label>Buscar página<input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
      {!trash ? <label>Estado<select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos</option><option value="published">Publicadas</option><option value="draft">Borradores</option></select></label> : null}
    </div>
    {state ? <p className={state.ok ? "admin-success" : "admin-error"} role="status">{state.message}</p> : null}
    <div className={styles.list} aria-busy={pending}>
      {visible.map(page => <article className={styles.row} key={page.id}>
        <div className={styles.identity}>
          <span className="status-pill">{trash ? "En papelera" : page.status === "draft" ? "Borrador · Privado" : page.noindex ? "Publicada · No indexar" : "Publicada · Indexación permitida"}</span>
          <h3>{page.title}</h3><p>/servicios/{page.slug}</p>
          <p>{trash ? "Eliminada" : "Actualizada"}: <time dateTime={page.deleted_at || page.updated_at}>{dateFormat.format(new Date(page.deleted_at || page.updated_at))}</time></p>
        </div>
        <div className={styles.actions}>
          {trash ? <>
            <form action={action}><input type="hidden" name="id" value={page.id} /><input type="hidden" name="operation" value="restore" /><button className="button button-secondary" disabled={pending}><RotateCcw size={16} />Restaurar borrador</button></form>
            <details className={styles.delete}>
              <summary>Eliminar definitivamente</summary>
              <form action={action} className="admin-form">
                <input type="hidden" name="id" value={page.id} /><input type="hidden" name="operation" value="delete" />
                <p>Esta eliminación no se puede deshacer.</p>
                <label>Confirmar enlace: {page.slug}<input name="confirmation" required autoComplete="off" maxLength={120} /></label>
                <button className="button button-danger" disabled={pending}><Trash2 size={16} />Eliminar definitivamente</button>
              </form>
            </details>
          </> : <>
            <Link className="button button-secondary" href={`/admin/servicios/paginas/${page.id}`}><Pencil size={16} />Editar texto y SEO</Link>
            <div className={styles.links}><Link className="back-link" target="_blank" rel="noreferrer" href={`/admin/servicios/paginas/${page.id}/vista-previa`}><Eye size={16} />Vista previa</Link>
              {page.status === "published" ? <Link className="back-link" target="_blank" rel="noreferrer" href={`/servicios/${page.slug}`}><ExternalLink size={16} />Ver publicada</Link> : null}</div>
            <form action={action} onSubmit={event => { if (!window.confirm(`¿Enviar «${page.title}» a la papelera? Dejará de estar disponible públicamente.`)) event.preventDefault(); }}>
              <input type="hidden" name="id" value={page.id} /><input type="hidden" name="operation" value="trash" /><button className="button button-secondary" disabled={pending}><Trash2 size={16} />Enviar a papelera</button>
            </form>
          </>}
        </div>
      </article>)}
      {!visible.length ? <p>{pages.length ? "No hay páginas que coincidan con la búsqueda." : trash ? "La papelera está vacía." : "No hay páginas de servicios vigentes."}</p> : null}
    </div>
  </>;
}
