"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createMember, deleteMember, listMembers, permanentlyDeleteMember, restoreMember, updateMember, uploadMemberPhoto } from "@/lib/members";

function revalidateMemberViews() {
  ["/", "/sobre-nosotros", "/admin", "/admin/miembros"].forEach((path) => revalidatePath(path));
}

function validId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function failure(error: unknown, message: string) {
  return { ok: false, message: error instanceof Error && error.message === "No autorizado"
    ? "Tu sesión expiró. Vuelve a iniciar sesión para continuar." : message };
}

async function saveMember(formData: FormData, editing: boolean) {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const role = String(formData.get("role") || "").trim();
    const focus = String(formData.get("focus") || "").trim();
    if ((editing && !validId(id)) || !name || !role || !focus || name.length > 200 || role.length > 300 || focus.length > 10000) {
      return { ok: false, message: "Completa un nombre, cargo y especialidad válidos." };
    }
    const sortOrder = Number(formData.get("sort_order") || 100);
    if (!Number.isSafeInteger(sortOrder) || sortOrder < 0 || sortOrder > 2147483647) {
      return { ok: false, message: "El orden debe ser un número entero válido." };
    }
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0 && (photo.size > 4 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(photo.type))) {
      return { ok: false, message: "Usa una foto JPG, PNG o WebP de hasta 4 MB." };
    }
    const photoUrl = photo instanceof File && photo.size > 0 ? await uploadMemberPhoto(photo) : null;
    const input = { name, role, focus, sort_order: sortOrder, is_active: formData.get("is_active") === "on" };
    if (editing) {
      await updateMember(id, { ...input, ...(photoUrl ? { photo_url: photoUrl } : {}) });
    } else {
      await createMember({ ...input, photo_url: photoUrl });
    }
    revalidateMemberViews();
    return { ok: true, message: editing ? "Miembro actualizado." : "Miembro creado." };
  } catch (error) {
    return failure(error, "No se pudo guardar el miembro. Revisa la conexión o si ya existe ese nombre y cargo, incluso en la papelera. Tus datos se conservaron.");
  }
}

export async function createMemberAction(_: unknown, formData: FormData) {
  return saveMember(formData, false);
}

export async function updateMemberAction(_: unknown, formData: FormData) {
  return saveMember(formData, true);
}

async function changeMember(formData: FormData, operation: "trash" | "restore" | "delete") {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    if (!validId(id)) return { ok: false, message: "El miembro no es válido. Actualiza la página." };
    if (operation === "delete") {
      const confirmation = String(formData.get("confirmation") || "");
      if (confirmation !== "ELIMINAR") return { ok: false, message: "Escribe ELIMINAR para confirmar la eliminación definitiva." };
      await permanentlyDeleteMember(id, confirmation);
    } else if (operation === "restore") {
      await restoreMember(id);
    } else {
      await deleteMember(id);
    }
    revalidateMemberViews();
    return { ok: true, message: operation === "restore" ? "Miembro restaurado como no visible." : operation === "trash" ? "Miembro enviado a la papelera." : "Miembro eliminado definitivamente." };
  } catch (error) {
    return failure(error, "No se pudo completar la operación. El miembro puede haber cambiado de estado. Actualiza la página e inténtalo nuevamente.");
  }
}

export async function deleteMemberAction(_: unknown, formData: FormData) {
  return changeMember(formData, "trash");
}

export async function restoreMemberAction(_: unknown, formData: FormData) {
  return changeMember(formData, "restore");
}

export async function permanentlyDeleteMemberAction(_: unknown, formData: FormData) {
  return changeMember(formData, "delete");
}

async function moveMember(formData: FormData, direction: "up" | "down") {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    if (!validId(id)) return { ok: false, message: "El miembro no es válido. Actualiza la página." };
    const members = await listMembers(undefined, true);
    const currentIndex = members.findIndex((member) => member.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= members.length) {
      return { ok: false, message: "No se puede mover este miembro. Actualiza la página." };
    }
    const reordered = [...members];
    const [current] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, current);
    await Promise.all(reordered.map((member, index) => updateMember(member.id, { sort_order: index + 1 })));
    revalidateMemberViews();
    return { ok: true, message: "Orden actualizado." };
  } catch (error) {
    return failure(error, "No se pudo actualizar el orden. Actualiza la página e inténtalo nuevamente.");
  }
}

export async function moveMemberUpAction(_: unknown, formData: FormData) {
  return moveMember(formData, "up");
}

export async function moveMemberDownAction(_: unknown, formData: FormData) {
  return moveMember(formData, "down");
}
