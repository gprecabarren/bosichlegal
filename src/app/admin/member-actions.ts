"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createMember, deleteMember, listMembers, updateMember, uploadMemberPhoto } from "@/lib/members";

function revalidateMemberViews() {
  ["/", "/sobre-nosotros", "/admin"].forEach((path) => revalidatePath(path));
}

export async function createMemberAction(_: unknown, formData: FormData) {
  await requireAdmin();

  const photo = formData.get("photo");
  const photoUrl = photo instanceof File && photo.size > 0 ? await uploadMemberPhoto(photo) : null;

  await createMember({
    name: String(formData.get("name") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    focus: String(formData.get("focus") || "").trim(),
    photo_url: photoUrl,
    sort_order: Number(formData.get("sort_order") || 100),
    is_active: formData.get("is_active") === "on",
  });

  revalidateMemberViews();
  return { ok: true, message: "Miembro creado." };
}

export async function updateMemberAction(_: unknown, formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const photo = formData.get("photo");
  const photoUrl = photo instanceof File && photo.size > 0 ? await uploadMemberPhoto(photo) : undefined;

  await updateMember(id, {
    name: String(formData.get("name") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    focus: String(formData.get("focus") || "").trim(),
    sort_order: Number(formData.get("sort_order") || 100),
    is_active: formData.get("is_active") === "on",
    ...(photoUrl ? { photo_url: photoUrl } : {}),
  });

  revalidateMemberViews();
  return { ok: true, message: "Miembro actualizado." };
}

export async function deleteMemberAction(formData: FormData) {
  await requireAdmin();
  await deleteMember(String(formData.get("id") || ""));
  revalidateMemberViews();
}

export async function moveMemberAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "");
  const members = await listMembers(undefined, true);
  const currentIndex = members.findIndex((member) => member.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= members.length) {
    revalidateMemberViews();
    return;
  }

  const reordered = [...members];
  const [current] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, current);

  await Promise.all(
    reordered.map((member, index) =>
      updateMember(member.id, {
        sort_order: index + 1,
      })
    )
  );

  revalidateMemberViews();
}
