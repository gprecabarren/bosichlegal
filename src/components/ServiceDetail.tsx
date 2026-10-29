import Link from "next/link";
import { ArrowRight, ExternalLink, MessageCircle } from "lucide-react";
import { siteUrl } from "@/lib/content";
import type { ServicePage, ServicePageSummary } from "@/types/service";
import type { SiteContent } from "@/types/site";

export function ServiceDetail({ page, content, pages }: { page: ServicePage; content: SiteContent; pages: ServicePageSummary[] }) {
  const c = page.content;
  const url = `${siteUrl()}/servicios/${page.slug}`;
  const related = pages.filter(p => p.slug !== page.slug && c.relatedSlugs.includes(p.slug));
  const whatsapp = `https://wa.me/${content.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola Bosich Legal, quisiera consultar por ${page.title}. ${url}`)}`;
  const sections = c.sections.map((section, index) => ({ ...section, anchor: `seccion-${index + 1}` }));
  const contents = <>{sections.map(s => <a href={`#${s.anchor}`} key={s.anchor}>{s.title}</a>)}{c.steps.length ? <a href="#etapas">Cómo trabajamos</a> : null}{c.faqs.length ? <a href="#preguntas">Preguntas frecuentes</a> : null}</>;
  const schemas = [
    { "@context": "https://schema.org", "@type": "Service", "@id": `${url}#servicio`, name: page.title, description: page.meta_description || c.intro, url, areaServed: { "@type": "Country", name: "Chile" }, provider: { "@type": "LegalService", name: content.brand.name, url: siteUrl(), telephone: content.contact.phone }, image: c.heroImage.startsWith("/") ? `${siteUrl()}${c.heroImage}` : c.heroImage },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl() }, { "@type": "ListItem", position: 2, name: "Servicios", item: `${siteUrl()}/servicios` }, { "@type": "ListItem", position: 3, name: page.title, item: url }] },
    ...(c.faqs.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }] : []),
  ];
  return <>
    <section className="service-detail-hero">
      <img src={c.heroImage} alt={c.heroAlt} fetchPriority="high" />
      <div className="service-detail-hero-content">
        <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href="/servicios">Servicios</Link></nav>
        <p className="eyebrow">{c.eyebrow}</p><h1>{page.title}</h1>
        <div className="hero-actions"><Link className="button" href="/contacto">Solicitar una consulta<ArrowRight size={18} /></Link><a className="button button-secondary" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} />Hablar por WhatsApp</a></div>
      </div>
    </section>
    <div className="section service-detail-layout">
      <aside className="service-detail-index"><p className="eyebrow">En esta página</p><nav aria-label="Contenido del servicio">{contents}</nav><Link className="back-link" href="/contacto">Consultar mi caso<ArrowRight size={16} /></Link></aside>
      <article className="service-detail-body">
        <p className="service-detail-intro">{c.intro}</p>
        <details className="service-mobile-index"><summary>Contenido de esta página</summary><nav aria-label="Contenido del servicio">{contents}</nav></details>
        {c.notice ? <div className="service-legal-note"><p>{c.notice}</p></div> : null}
        {sections.map(s => <section id={s.anchor} className="service-content-section" key={s.anchor}><h2>{s.title}</h2>{s.text.split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}{s.bullets.length ? <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul> : null}</section>)}
        {c.steps.length ? <section id="etapas" className="service-content-section"><p className="eyebrow">Del análisis a la acción</p><h2>Cómo trabajamos</h2><ol className="service-process">{c.steps.map((s, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{s.title}</h3><p>{s.text}</p></div></li>)}</ol></section> : null}
        {c.faqs.length ? <section id="preguntas" className="service-content-section"><h2>Preguntas frecuentes</h2><div className="service-faqs">{c.faqs.map((f, i) => <details key={i}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div></section> : null}
        {related.length ? <section className="service-content-section"><h2>Áreas relacionadas</h2><div className="service-related">{related.map(p => <Link href={`/servicios/${p.slug}`} key={p.id}>{p.title}<ArrowRight size={18} /></Link>)}</div></section> : null}
        {c.sources.length ? <section className="service-content-section service-sources"><h2>Fuentes y referencias</h2>{c.reviewedAt ? <p>Revisión de contenido: <time dateTime={c.reviewedAt}>{new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${c.reviewedAt}T12:00:00Z`))}</time>.</p> : null}<ul>{c.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.label}<ExternalLink size={14} /></a></li>)}</ul></section> : null}
        <section className="service-detail-contact"><p className="eyebrow">Bosich Legal</p><h2>Conversemos sobre tu situación</h2><p>Cuéntanos brevemente qué necesitas. Definiremos contigo los antecedentes y el alcance de una primera evaluación.</p><Link className="button" href="/contacto">Contactar al estudio<ArrowRight size={18} /></Link></section>
      </article>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, "\\u003c") }} />
  </>;
}
