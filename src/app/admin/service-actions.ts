"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/content";
import { serviceIcons } from "@/lib/service-icons";
import type { SiteContent } from "@/types/site";

export async function saveServicesAction(_: unknown, formData: FormData) {
  try {
    await requireAdmin();
    const title = String(formData.get("title") || "").trim();
    const items: SiteContent["services"]["items"] = JSON.parse(String(formData.get("items") || "[]"));
    if (!title || title.length > 160 || !Array.isArray(items) || items.length < 1 || items.length > 30) {
      throw new Error("Completa el título y al menos un servicio.");
    }
    for (const item of items) {
      if (!item || typeof item.title !== "string" || !item.title.trim() || item.title.length > 160
        || typeof item.description !== "string" || item.description.length > 3000
        || !Array.isArray(item.details) || item.details.length > 30
        || item.details.some((detail) => typeof detail !== "string" || detail.length > 500)
        || !serviceIcons.some(({ id }) => id === item.icon)) {
        throw new Error("Revisa el título, descripción e ícono de cada servicio.");
      }
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
        items: items.map((item) => ({ ...item, title: item.title.trim(), details: item.details.map((line) => line.trim()).filter(Boolean) })),
      },
    });
    revalidatePath("/", "layout");
    return { ok: true, message: "Servicios actualizados en inicio y en la página de servicios." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudieron guardar los servicios." };
  }
}
