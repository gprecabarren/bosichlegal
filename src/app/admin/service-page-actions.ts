"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { validateServicePage } from "@/lib/service-fields";
import { changeServicePageLifecycle, saveServicePage } from "@/lib/service-pages";

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

export async function changeServicePageLifecycleAction(_: ServicePageActionState, data: FormData): Promise<ServicePageActionState> {
  try {
    await requireAdmin();
    const id = String(data.get("id") || "");
    const operation = data.get("operation");
    if (!/^[a-f0-9-]{36}$/i.test(id) || (operation !== "trash" && operation !== "restore" && operation !== "delete")) throw new Error("Operación no válida.");
    await changeServicePageLifecycle(id, operation, String(data.get("confirmation") || ""));
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    return { ok: true, message: operation === "trash" ? "Página enviada a la papelera." : operation === "restore" ? "Página restaurada como borrador." : "Página eliminada definitivamente." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar la página." };
  }
}
