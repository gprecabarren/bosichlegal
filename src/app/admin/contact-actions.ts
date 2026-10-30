"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { permanentlyDeleteContact, setContactDeleted, updateContactStatus } from "@/lib/contact-submissions";
import type { ContactStatus } from "@/types/contact";

const allowedStatuses: ContactStatus[] = ["new", "reviewed", "contacted", "archived"];

async function changeContact(formData: FormData, operation: "status" | "trash" | "restore" | "delete") {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return { ok: false, message: "La solicitud no es válida. Actualiza la página." };
    }
    if (operation === "status") {
      const status = String(formData.get("status") || "") as ContactStatus;
      if (!allowedStatuses.includes(status)) return { ok: false, message: "Selecciona un estado válido." };
      await updateContactStatus(id, status);
    } else if (operation === "delete") {
      const confirmation = String(formData.get("confirmation") || "");
      if (confirmation !== "ELIMINAR") return { ok: false, message: "Escribe ELIMINAR para confirmar la eliminación definitiva." };
      await permanentlyDeleteContact(id, confirmation);
    } else {
      await setContactDeleted(id, operation === "trash");
    }
    revalidatePath("/admin");
    revalidatePath("/admin/solicitudes-contacto");
    const messages = { status: "Estado actualizado.", trash: "Solicitud enviada a la papelera.", restore: "Solicitud restaurada con su estado anterior.", delete: "Solicitud eliminada definitivamente." };
    return { ok: true, message: messages[operation] };
  } catch (error) {
    return { ok: false, message: error instanceof Error && error.message === "No autorizado"
      ? "Tu sesión expiró. Vuelve a iniciar sesión para continuar."
      : "No se pudo actualizar la solicitud. Revisa la conexión o si cambió de estado y vuelve a intentarlo." };
  }
}

export async function updateContactStatusAction(_: unknown, formData: FormData) {
  return changeContact(formData, "status");
}

export async function deleteContactAction(_: unknown, formData: FormData) {
  return changeContact(formData, "trash");
}

export async function restoreContactAction(_: unknown, formData: FormData) {
  return changeContact(formData, "restore");
}

export async function permanentlyDeleteContactAction(_: unknown, formData: FormData) {
  return changeContact(formData, "delete");
}
