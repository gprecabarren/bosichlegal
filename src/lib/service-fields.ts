import type { ServiceItem, ServicePageInput, ServicePageSummary } from "../types/service.ts";

export function serviceSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 120).replace(/^-+|-+$/g, "");
}

export function safeContentImage(value: string) {
  if (/^\/assets\/[a-zA-Z0-9/_\-.]+\.(png|jpg|jpeg|webp)$/i.test(value)) return !value.split("/").some(part => part === "." || part === "..");
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}

export function safeSourceUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}

export function emptyServicePage(): ServicePageInput {
  return { slug: "", title: "", status: "draft", noindex: true, seo_title: "", meta_description: "", focus_keyword: "", og_title: "", og_description: "",
    content: { eyebrow: "Servicios jurídicos", intro: "", heroImage: "/assets/site/services-hero.png", heroAlt: "", notice: "", sections: [], steps: [], faqs: [], sources: [], relatedSlugs: [], reviewedAt: "" } };
}

function text(value: unknown, max: number, required = false): value is string {
  return typeof value === "string" && value.length <= max && (!required || !!value.trim());
}

export function validateServicePage(value: unknown): asserts value is ServicePageInput {
  if (!value || typeof value !== "object") throw new Error("Completa la página del servicio.");
  const p = value as ServicePageInput;
  if (!text(p.title, 180, true) || !text(p.slug, 120, true) || p.slug !== serviceSlug(p.slug)) throw new Error("Revisa el título y el enlace de la página.");
  if (!["draft", "published"].includes(p.status) || typeof p.noindex !== "boolean") throw new Error("Revisa el estado de publicación.");
  for (const key of ["seo_title", "meta_description", "focus_keyword", "og_title", "og_description"] as const) {
    if (!text(p[key], key.includes("description") ? 320 : 180)) throw new Error("Revisa los campos SEO.");
  }
  const c = p.content;
  if (!c || !text(c.eyebrow, 100) || !text(c.intro, 3000, p.status === "published") || !text(c.heroAlt, 240, p.status === "published") || !text(c.heroImage, 2000) || !safeContentImage(c.heroImage) || !text(c.notice, 2000)) throw new Error("Completa la introducción, la imagen y su texto alternativo.");
  if (!Array.isArray(c.sections) || c.sections.length > 20 || (p.status === "published" && !c.sections.length)
    || c.sections.some(s => !s || !text(s.title, 180, true) || !text(s.text, 12000) || !Array.isArray(s.bullets) || s.bullets.length > 30 || s.bullets.some(b => !text(b, 800)))) throw new Error("Revisa las secciones de contenido.");
  if (!Array.isArray(c.steps) || c.steps.length > 12 || c.steps.some(s => !s || !text(s.title, 180, true) || !text(s.text, 3000, true))) throw new Error("Revisa las etapas del servicio.");
  if (!Array.isArray(c.faqs) || c.faqs.length > 20 || c.faqs.some(f => !f || !text(f.question, 300, true) || !text(f.answer, 4000, true))) throw new Error("Revisa las preguntas frecuentes.");
  if (!Array.isArray(c.sources) || c.sources.length > 15 || c.sources.some(s => !s || !text(s.label, 180, true) || !text(s.url, 2000) || !safeSourceUrl(s.url))) throw new Error("Usa enlaces HTTPS válidos para las fuentes.");
  if (!Array.isArray(c.relatedSlugs) || c.relatedSlugs.length > 10 || c.relatedSlugs.some(s => !text(s, 120, true) || s !== serviceSlug(s))) throw new Error("Revisa los servicios relacionados.");
  if (!text(c.reviewedAt, 10) || (c.reviewedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(c.reviewedAt) || !Number.isFinite(Date.parse(c.reviewedAt)) || new Date(c.reviewedAt).toISOString().slice(0, 10) !== c.reviewedAt))) throw new Error("Revisa la fecha de revisión.");
}

export function serviceLinks(item: ServiceItem, pages: ServicePageSummary[]) {
  if (!item.clickable) return { primary: undefined, topics: [] };
  const published = new Map(pages.filter(p => p.status === "published").map(p => [p.slug, p]));
  const primary = published.get(item.pageSlug || "");
  return { primary, topics: primary ? (item.topics || []).filter(t => published.has(t.pageSlug)) : [] };
}

export function indexableServicePages<T extends Pick<ServicePageInput, "status" | "noindex">>(pages: T[]) {
  return pages.filter(p => p.status === "published" && !p.noindex);
}
