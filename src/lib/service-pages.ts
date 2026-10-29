import "server-only";
import { cache } from "react";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ServicePage, ServicePageInput, ServicePageSummary } from "@/types/service";
import initialPages from "../../content/service-pages.json";

const localPages = initialPages.map((p, index) => ({ ...p, id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, created_at: "2026-10-29T00:00:00Z", updated_at: "2026-10-29T00:00:00Z" })) as ServicePage[];

const table = "service_pages";
function client() {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase no está configurado para las páginas de servicios.");
  return db;
}
export const listServicePages = cache(async (): Promise<ServicePageSummary[]> => {
  const db = getSupabaseAdmin();
  if (!db) return localPages.filter(p => p.status === "published");
  const { data, error } = await db.from(table).select("id,slug,title,status,noindex,updated_at").eq("status", "published").order("created_at");
  if (error && !["PGRST205", "42P01"].includes(error.code)) throw new Error("No se pudieron cargar las páginas de servicios.");
  return (data || []) as ServicePageSummary[];
});
export const getPublicServicePage = cache(async (slug: string): Promise<ServicePage | null> => {
  const db = getSupabaseAdmin();
  if (!db) return localPages.find(p => p.slug === slug && p.status === "published") || null;
  const { data, error } = await db.from(table).select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error && !["PGRST205", "42P01"].includes(error.code)) throw new Error("No se pudo cargar el servicio.");
  return data as ServicePage | null;
});
export async function listAdminServicePages(): Promise<ServicePageSummary[]> {
  await requireAdmin();
  const { data, error } = await client().from(table).select("id,slug,title,status,noindex,updated_at").order("created_at");
  if (error) throw new Error("No se pudieron consultar las páginas de servicios.");
  return (data || []) as ServicePageSummary[];
}
export async function getAdminServicePage(id: string): Promise<ServicePage | null> {
  await requireAdmin();
  if (!/^[a-f0-9-]{36}$/i.test(id)) return null;
  const { data, error } = await client().from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("No se pudo cargar la página.");
  return data as ServicePage | null;
}
export async function saveServicePage(id: string | null, input: ServicePageInput) {
  await requireAdmin();
  const db = client();
  if (id) {
    const existing = await getAdminServicePage(id);
    if (!existing || existing.slug !== input.slug) throw new Error("La URL de una página creada no se puede cambiar.");
    if (input.status !== "published") {
      const { getSiteContent } = await import("@/lib/content");
      const content = await getSiteContent();
      if (content.services.items.some(s => s.clickable && (s.pageSlug === existing.slug || s.topics?.some(t => t.pageSlug === existing.slug)))) throw new Error("Desactiva primero los enlaces de esta página en las tarjetas de servicios.");
    }
  }
  const c = input.content;
  const payload: ServicePageInput = {
    slug: input.slug, title: input.title.trim(), status: input.status, noindex: input.noindex,
    seo_title: input.seo_title.trim(), meta_description: input.meta_description.trim(), focus_keyword: input.focus_keyword.trim(), og_title: input.og_title.trim(), og_description: input.og_description.trim(),
    content: { eyebrow: c.eyebrow.trim(), intro: c.intro.trim(), heroImage: c.heroImage.trim(), heroAlt: c.heroAlt.trim(), notice: c.notice.trim(), reviewedAt: c.reviewedAt,
      sections: c.sections.map(s => ({ title: s.title.trim(), text: s.text.trim(), bullets: s.bullets.map(b => b.trim()).filter(Boolean) })),
      steps: c.steps.map(s => ({ title: s.title.trim(), text: s.text.trim() })), faqs: c.faqs.map(f => ({ question: f.question.trim(), answer: f.answer.trim() })),
      sources: c.sources.map(s => ({ label: s.label.trim(), url: s.url.trim() })), relatedSlugs: [...new Set(c.relatedSlugs)] },
  };
  const query = id ? db.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id) : db.from(table).insert(payload);
  const { data, error } = await query.select("*").single();
  if (error?.code === "23505") throw new Error("Ya existe una página con ese enlace.");
  if (error || !data) throw new Error("No se pudo guardar la página. Tus campos se conservaron.");
  return data as ServicePage;
}
