"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/content";
import { serviceIcons } from "@/lib/service-icons";
import type { SiteContent } from "@/types/site";
import { listAdminServicePages } from "@/lib/service-pages";
import { serviceSlug } from "@/lib/service-fields";

export async function saveServicesAction(_: unknown, formData: FormData) {
  try {
    await requireAdmin();
    const title = String(formData.get("title") || "").trim();
    const items: SiteContent["services"]["items"] = JSON.parse(String(formData.get("items") || "[]"));
    if (!title || title.length > 160 || !Array.isArray(items) || items.length < 1 || items.length > 30) {
      throw new Error("Completa el título y al menos un servicio.");
    }
    const published = new Set((await listAdminServicePages()).filter(p => p.status === "published").map(p => p.slug));
    for (const item of items) {
      if (!item || typeof item.title !== "string" || !item.title.trim() || item.title.length > 160
        || typeof item.description !== "string" || item.description.length > 3000
        || !Array.isArray(item.details) || item.details.length > 30
        || item.details.some((detail) => typeof detail !== "string" || detail.length > 500)
        || !serviceIcons.some(({ id }) => id === item.icon)
        || typeof item.showOnHome !== "boolean" || typeof item.clickable !== "boolean"
        || typeof item.pageSlug !== "string" || (item.pageSlug && item.pageSlug !== serviceSlug(item.pageSlug))
        || !Array.isArray(item.topics) || item.topics.length > 6
        || item.topics.some(t => !t || typeof t.label !== "string" || t.label.length > 100 || (item.clickable && !t.label.trim()) || typeof t.pageSlug !== "string" || t.pageSlug !== serviceSlug(t.pageSlug))) {
        throw new Error("Revisa el título, descripción e ícono de cada servicio.");
      }
      if (item.clickable && (!published.has(item.pageSlug || "") || item.topics.some(t => !published.has(t.pageSlug)))) throw new Error("Selecciona páginas publicadas para todos los enlaces de las tarjetas activas.");
      if (item.clickable && new Set(item.topics.map(t => t.pageSlug)).size !== item.topics.length) throw new Error("No repitas la misma página entre los temas de un servicio.");
    }
    const current = await getSiteContent();
    await saveSiteContent({
      ...current,
      services: {
        ...current.services,
        title,
        description: String(formData.get("description") || "").trim().slice(0, 3000),
        homeTitle: String(formData.get("homeTitle") || "").trim().slice(0, 160),
        introTitle: String(formData.get("introTitle") || "").trim().slice(0, 160),
        items: items.map(item => ({ title: item.title.trim(), description: item.description!.trim(), icon: item.icon, details: item.details.map(line => line.trim()).filter(Boolean), showOnHome: item.showOnHome, clickable: item.clickable, pageSlug: item.pageSlug, topics: item.topics!.map(t => ({ label: t.label.trim(), pageSlug: t.pageSlug })) })),
      },
    });
    revalidatePath("/", "layout");
    return { ok: true, message: "Servicios actualizados en inicio y en la página de servicios." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudieron guardar los servicios." };
  }
}
