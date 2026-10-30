import "server-only";
import { cache } from "react";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { serviceCardReferences } from "@/lib/service-fields";
import { sanitizeNewsHtml } from "@/lib/news";
import type { ServicePage, ServicePageInput, ServicePageSummary } from "@/types/service";
import initialPages from "../../content/service-pages.json";

const localPages = initialPages.map((p, index) => ({ ...p, id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, created_at: "2026-10-29T00:00:00Z", updated_at: "2026-10-29T00:00:00Z", deleted_at: null })) as ServicePage[];

const table = "service_pages";
function client() {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase no está configurado para las páginas de servicios.");
  return db;
}
export const listServicePages = cache(async (): Promise<ServicePageSummary[]> => {
  const db = getSupabaseAdmin();
  if (!db) return localPages.filter(p => p.status === "published" && !p.deleted_at);
  const { data, error } = await db.from(table).select("id,slug,title,status,noindex,updated_at,deleted_at").eq("status", "published").is("deleted_at", null).order("created_at");
  if (error && !["PGRST205", "42P01"].includes(error.code)) throw new Error("No se pudieron cargar las páginas de servicios.");
  return (data || []) as ServicePageSummary[];
});
export const getPublicServicePage = cache(async (slug: string): Promise<ServicePage | null> => {
  const db = getSupabaseAdmin();
  if (!db) return localPages.find(p => p.slug === slug && p.status === "published" && !p.deleted_at) || null;
  const { data, error } = await db.from(table).select("*").eq("slug", slug).eq("status", "published").is("deleted_at", null).maybeSingle();
  if (error && !["PGRST205", "42P01"].includes(error.code)) throw new Error("No se pudo cargar el servicio.");
  return data as ServicePage | null;
});
export async function listAdminServicePages(view: "active" | "trash" = "active"): Promise<ServicePageSummary[]> {
  await requireAdmin();
  const query = client().from(table).select("id,slug,title,status,noindex,updated_at,deleted_at");
  const { data, error } = await (view === "trash" ? query.not("deleted_at", "is", null) : query.is("deleted_at", null)).order("updated_at", { ascending: false });
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
    if (!existing) throw new Error("La página ya no existe.");
    if (existing.deleted_at) throw new Error("Restaura la página desde la papelera antes de editarla.");
    if (existing.slug !== input.slug) throw new Error("La URL de una página creada no se puede cambiar.");
    if (input.status !== "published") {
      await assertServicePageUnlinked(existing);
    }
  }
  const c = input.content;
  const payload: ServicePageInput = {
    slug: input.slug, title: input.title.trim(), status: input.status, noindex: input.noindex,
    seo_title: input.seo_title.trim(), meta_description: input.meta_description.trim(), focus_keyword: input.focus_keyword.trim(), og_title: input.og_title.trim(), og_description: input.og_description.trim(),
    content: { ...(c.copy ? { copy: Object.fromEntries(Object.entries(c.copy).map(([key, value]) => [key, value.trim()])) } : {}), eyebrow: c.eyebrow.trim(), intro: c.intro.trim(), heroImage: c.heroImage.trim(), heroAlt: c.heroAlt.trim(), notice: c.notice.trim(), reviewedAt: c.reviewedAt,
      sections: c.sections.map(s => ({ title: s.title.trim(), text: s.text.trim(), ...(s.html !== undefined ? { html: sanitizeNewsHtml(s.html) } : {}), bullets: s.bullets.map(b => b.trim()).filter(Boolean) })),
      steps: c.steps.map(s => ({ title: s.title.trim(), text: s.text.trim() })), faqs: c.faqs.map(f => ({ question: f.question.trim(), answer: f.answer.trim() })),
      sources: c.sources.map(s => ({ label: s.label.trim(), url: s.url.trim() })), relatedSlugs: [...new Set(c.relatedSlugs)] },
  };
  const query = id ? db.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).is("deleted_at", null) : db.from(table).insert(payload);
  const { data, error } = await query.select("*").single();
  if (error?.code === "23505") throw new Error("Ya existe una página con ese enlace.");
  if (error || !data) throw new Error("No se pudo guardar la página. Tus campos se conservaron.");
  return data as ServicePage;
}

async function assertServicePageUnlinked(page: ServicePage, permanent = false) {
  const { getSiteContent } = await import("@/lib/content");
  const content = await getSiteContent();
  const cards = serviceCardReferences(content.services.items, page.slug, permanent);
  if (cards.length) throw new Error(`Quita primero los enlaces de las tarjetas de servicios: ${cards.map(card => card.title).join(", ")}.`);
  let references = client().from(table).select("id,title").neq("id", page.id).contains("content", { relatedSlugs: [page.slug] });
  if (!permanent) references = references.is("deleted_at", null);
  const { data, error } = await references;
  if (error) throw new Error("No se pudieron verificar las páginas relacionadas. Intenta nuevamente.");
  if (data?.length) throw new Error(`Quita primero esta página de los servicios relacionados en: ${data.map(p => p.title).join(", ")}.`);
}

export async function changeServicePageLifecycle(id: string, operation: "trash" | "restore" | "delete", confirmation = "") {
  await requireAdmin();
  const page = await getAdminServicePage(id);
  if (!page) throw new Error("La página ya no existe.");
  if (operation === "trash" ? !!page.deleted_at : !page.deleted_at) {
    throw new Error(operation === "trash" ? "La página ya está en la papelera." : "La página debe estar en la papelera.");
  }
  if (operation === "delete" && confirmation !== page.slug) throw new Error("Escribe el enlace exacto de la página para confirmar la eliminación definitiva.");
  if (operation !== "restore") await assertServicePageUnlinked(page, operation === "delete");
  const db = client();
  const now = new Date().toISOString();
  const query = operation === "delete" ? db.from(table).delete()
    : db.from(table).update({ deleted_at: operation === "trash" ? now : null, status: "draft", updated_at: now });
  const scoped = query.eq("id", page.id);
  const { data, error } = await (page.deleted_at ? scoped.eq("deleted_at", page.deleted_at) : scoped.is("deleted_at", null)).select("id").maybeSingle();
  if (error || !data) throw new Error("No se pudo actualizar la página. Recarga la lista y vuelve a intentar.");
}
