"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createNewsPost, deleteNewsPost, updateNewsPost, uploadNewsImage } from "@/lib/news";
import type { NewsStatus } from "@/types/news";

function revalidateNewsViews() {
  ["/", "/admin", "/noticias"].forEach((path) => revalidatePath(path));
}

function statusFromForm(value: FormDataEntryValue | null): NewsStatus {
  return value === "published" ? "published" : "draft";
}

async function coverUrlFromForm(formData: FormData, existing?: string | null) {
  const file = formData.get("cover_image");
  if (file instanceof File && file.size > 0) return uploadNewsImage(file);
  return String(formData.get("cover_image_url") || existing || "").trim() || null;
}

export async function createNewsAction(_: unknown, formData: FormData) {
  await requireAdmin();

  try {
    await createNewsPost({
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      excerpt: String(formData.get("excerpt") || ""),
      content_html: String(formData.get("content_html") || ""),
      cover_image_url: await coverUrlFromForm(formData),
      status: statusFromForm(formData.get("status")),
    });
    revalidateNewsViews();
    return { ok: true, message: "Noticia guardada." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar la noticia." };
  }
}

export async function updateNewsAction(_: unknown, formData: FormData) {
  await requireAdmin();

  try {
    const id = String(formData.get("id") || "");
    const existingCover = String(formData.get("cover_image_url") || "");
    await updateNewsPost(id, {
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      excerpt: String(formData.get("excerpt") || ""),
      content_html: String(formData.get("content_html") || ""),
      cover_image_url: await coverUrlFromForm(formData, existingCover),
      status: statusFromForm(formData.get("status")),
    });
    revalidatePath(`/noticias/${String(formData.get("slug") || "")}`);
    revalidateNewsViews();
    return { ok: true, message: "Noticia actualizada." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar la noticia." };
  }
}

export async function deleteNewsAction(formData: FormData) {
  await requireAdmin();
  await deleteNewsPost(String(formData.get("id") || ""));
  revalidateNewsViews();
}
