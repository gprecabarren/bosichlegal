"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, Save, Trash2, WandSparkles } from "lucide-react";
import { getPageContent, getPageSeo, getStaticPage, pageSeoFields } from "@/lib/page-content";
import type { PageFieldValue, SiteContent, StaticPageSeo } from "@/types/site";
import { saveStaticPageAction } from "./page-actions";
import { ServicePageImageField } from "./ServicePageImageField";

export function StaticPageEditor({ pageId, content }: { pageId: string; content: SiteContent }) {
  const page = getStaticPage(pageId)!;
  const [fields, setFields] = useState(() => getPageContent(content, page.path).values);
  const initialSeo = getPageSeo(content, page.path);
  const [seo, setSeo] = useState<StaticPageSeo>(() => ({ title: initialSeo.title, description: initialSeo.description, canonical: initialSeo.canonical, ogTitle: content.pages?.[page.path]?.seo?.ogTitle || "", ogDescription: content.pages?.[page.path]?.seo?.ogDescription || "", ogImage: content.pages?.[page.path]?.seo?.ogImage || "", noindex: initialSeo.noindex }));
  const [offices, setOffices] = useState(content.locations.items);
  const [tab, setTab] = useState("content");
  const [uploading, setUploading] = useState(false);
  const [state, action, pending] = useActionState(saveStaticPageAction, null);
  const set = (key: string, value: PageFieldValue) => setFields(current => ({ ...current, [key]: value }));
  const groups = [...new Set(page.fields.map(field => field.group))];
  return <form className="admin-form static-page-editor" onSubmit={event => { event.preventDefault(); if (uploading || pending) return; const data = new FormData(event.currentTarget); startTransition(() => action(data)); }}>
    <div className="editor-section-heading"><div><Link className="back-link" href="/admin/paginas"><ArrowLeft size={16} />Páginas y SEO</Link><h2>Editar {page.label}</h2></div><Link className="back-link" href={page.path} target="_blank" rel="noreferrer"><ExternalLink size={16} />Ver página</Link></div>
    <input type="hidden" name="pageId" value={page.id} /><input type="hidden" name="content" value={JSON.stringify({ fields, ...(page.path === "/ubicacion" ? { offices } : {}) })} /><input type="hidden" name="seo" value={JSON.stringify(seo)} />
    <div className="admin-editor-tabs" role="tablist" aria-label="Editor de página"><button type="button" role="tab" id="tab-content" aria-selected={tab === "content"} aria-controls="panel-content" onClick={() => setTab("content")}>Contenido</button><button type="button" role="tab" id="tab-seo" aria-selected={tab === "seo"} aria-controls="panel-seo" onClick={() => setTab("seo")}>SEO y redes</button></div>
    <fieldset disabled={pending} className="service-fieldset">
      <div role="tabpanel" id="panel-content" aria-labelledby="tab-content" hidden={tab !== "content"}>
        {groups.map(group => <section key={group}><h3>{group}</h3>{page.fields.filter(field => field.group === group).map(spec => {
          const value = fields[spec.key];
          if (spec.type === "image") return <div className="static-image-field" key={spec.key}><h4>{spec.label}</h4><ServicePageImageField value={String(value || "")} alt={String(fields.heroAlt || spec.label)} uploading={uploading} onUploading={setUploading} onChange={url => set(spec.key, url)} /></div>;
          return <label key={spec.key}>{spec.label}{spec.type === "textarea" || spec.type === "lines" ? <textarea rows={spec.type === "lines" ? 6 : 3} maxLength={spec.maxLength} value={Array.isArray(value) ? value.join("\n") : value} onChange={event => set(spec.key, spec.type === "lines" ? event.target.value.split("\n") : event.target.value)} /> : <input maxLength={spec.maxLength} required={spec.required} value={String(value || "")} onChange={event => set(spec.key, event.target.value)} />}</label>;
        })}</section>)}
        {page.path === "/ubicacion" ? <section><h3>Oficinas y mapas</h3>{offices.map((office, index) => <div className="service-content-editor-row" key={index}><div className="editor-section-heading"><h4>Oficina {index + 1}</h4><div className="icon-toolbar">{[-1, 1].map(direction => <button key={direction} type="button" disabled={index + direction < 0 || index + direction >= offices.length} title={direction < 0 ? "Subir oficina" : "Bajar oficina"} aria-label={direction < 0 ? "Subir oficina" : "Bajar oficina"} onClick={() => setOffices(current => { const next = [...current]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; })}>{direction < 0 ? <ArrowUp size={17} /> : <ArrowDown size={17} />}</button>)}<button type="button" title="Quitar oficina" aria-label="Quitar oficina" onClick={() => setOffices(current => current.filter((_, position) => position !== index))}><Trash2 size={17} /></button></div></div>{([["city", "Ciudad"], ["address", "Dirección"], ["mapQuery", "Dirección para Google Maps"]] as const).map(([key, label]) => <label key={key}>{label}<input required maxLength={500} value={office[key]} onChange={event => setOffices(current => current.map((item, position) => position === index ? { ...item, [key]: event.target.value } : item))} /></label>)}</div>)}<button type="button" className="button button-secondary" disabled={offices.length >= 20} onClick={() => setOffices(current => [...current, { city: "", address: "", mapQuery: "" }])}><Plus size={16} />Agregar oficina</button></section> : null}
        <section><h3>Contenido relacionado</h3>{page.links.map(link => <Link className="back-link" href={link.href} key={link.href}>{link.label}<ExternalLink size={16} /></Link>)}</section>
      </div>
      <div role="tabpanel" id="panel-seo" aria-labelledby="tab-seo" hidden={tab !== "seo"}><section><div className="editor-section-heading"><h3>SEO y redes sociales</h3><button type="button" className="button button-secondary" onClick={() => setSeo(current => ({ ...current, title: current.title || String(fields.title || ""), description: current.description || String(fields.description || fields.introText || "").slice(0, 160), ogTitle: current.ogTitle || current.title || String(fields.title || ""), ogDescription: current.ogDescription || current.description || String(fields.description || "").slice(0, 160), ogImage: current.ogImage || String(fields.heroImage || "") }))}><WandSparkles size={16} />Completar campos vacíos</button></div>
        {pageSeoFields.map(spec => <label key={spec.key}>{spec.label}{spec.key.includes("escription") ? <textarea rows={3} maxLength={spec.maxLength} value={seo[spec.key] || ""} onChange={event => setSeo(current => ({ ...current, [spec.key]: event.target.value }))} /> : <input maxLength={spec.maxLength} value={seo[spec.key] || ""} onChange={event => setSeo(current => ({ ...current, [spec.key]: event.target.value }))} />}<span className="admin-help">{String(seo[spec.key] || "").length} / {spec.maxLength}</span></label>)}
        <label className="checkbox-label"><input type="checkbox" checked={!seo.noindex} onChange={event => setSeo(current => ({ ...current, noindex: !event.target.checked }))} />Permitir indexación en buscadores</label>
        <p className="admin-help">Al desactivar la indexación se aplica noindex y se excluye del sitemap. Google puede demorar en reflejarlo; esto no hace privada la página.</p>
        <div className="seo-result-preview"><p>{seo.canonical || page.path}</p><h4>{seo.title || fields.title}</h4><p>{seo.description}</p></div>
      </section></div>
    </fieldset>
    <div className="admin-actions"><button className="button" disabled={pending || uploading}><Save size={18} />{pending ? "Guardando..." : "Guardar textos y SEO"}</button>{state ? <p role="status" className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null}</div>
  </form>;
}
