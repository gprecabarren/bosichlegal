"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { validateServicePage } from "@/lib/service-fields";
import { saveServicePage } from "@/lib/service-pages";

export type ServicePageActionState = { ok: boolean; message: string; id?: string; slug?: string } | null;
export async function saveServicePageAction(_: ServicePageActionState, data: FormData): Promise<ServicePageActionState> {
  let saved: { id: string; slug: string } | undefined;
  try {
    await requireAdmin();
    const raw = String(data.get("page") || "");
    if (raw.length > 400000) throw new Error("El contenido supera el tamaño permitido.");
    const input: unknown = JSON.parse(raw);
    validateServicePage(input);
    const id = String(data.get("id") || "");
    if (id && !/^[a-f0-9-]{36}$/i.test(id)) throw new Error("Página no válida.");
    const page = await saveServicePage(id || null, input);
    saved = page;
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    return { ok: true, message: "Página guardada correctamente.", id: page.id, slug: page.slug };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar la página.", ...saved };
  }
}
