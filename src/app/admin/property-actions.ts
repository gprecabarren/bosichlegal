"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getAdminProperty, permanentlyDeleteProperty, saveProperty, setPropertyDeleted } from "@/lib/properties";
import { validateProperty } from "@/lib/property-fields";

function refreshProperties() {
  revalidatePath("/propiedades", "layout");
  revalidatePath("/admin/propiedades", "layout");
  revalidatePath("/sitemap.xml");
}

export async function deletePropertyPermanentlyAction(_: unknown, formData: FormData) {
  try {
    await requireAdmin();
    if (formData.get("confirmation") !== "ELIMINAR") throw new Error("Escribe ELIMINAR para confirmar.");
    await permanentlyDeleteProperty(String(formData.get("id") || ""));
    refreshProperties();
    return { ok: true, message: "Propiedad eliminada definitivamente." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo eliminar la propiedad." };
  }
}

export async function savePropertyAction(_: unknown, formData: FormData) {
  const id = String(formData.get("id") || "");
  try {
    await requireAdmin();
    if (id && !(await getAdminProperty(id))) throw new Error("La propiedad no existe.");
    const input = validateProperty(JSON.parse(String(formData.get("property") || "{}")));
    const property = await saveProperty(id || null, input);
    refreshProperties();
    return { ok: true, message: "Propiedad guardada correctamente.", id: property.id, slug: property.slug };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar la propiedad.", id, slug: "" };
  }
}

export async function changePropertyVisibilityAction(_: unknown, formData: FormData) {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    if (!(await getAdminProperty(id))) throw new Error("La propiedad no existe.");
    const deleted = formData.get("restore") !== "true";
    await setPropertyDeleted(id, deleted);
    refreshProperties();
    return { ok: true, message: deleted ? "Propiedad enviada a la papelera." : "Propiedad restaurada como borrador." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar la propiedad." };
  }
}
