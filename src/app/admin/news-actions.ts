"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createNewsPost, deleteNewsPost, updateNewsPost, uploadNewsImage } from "@/lib/news";
import type { NewsActionState, NewsFormValues, NewsStatus } from "@/types/news";

function revalidateNewsViews() {
  ["/", "/admin", "/noticias"].forEach((path) => revalidatePath(path));
}

function statusFromForm(value: FormDataEntryValue | null): NewsStatus {
  return value === "published" ? "published" : "draft";
}

function emptyNewsValues(): NewsFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content_html: "",
    cover_image_url: "",
    status: "draft",
  };
}

function valuesFromForm(formData: FormData): NewsFormValues {
  return {
    id: String(formData.get("id") || ""),
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    content_html: String(formData.get("content_html") || ""),
    cover_image_url: String(formData.get("cover_image_url") || ""),
    status: statusFromForm(formData.get("status")),
  };
}

function state(ok: boolean, message: string, values: NewsFormValues): Exclude<NewsActionState, null> {
  return {
    ok,
    message,
    values,
    resetKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

async function coverUrlFromForm(formData: FormData, existing?: string | null) {
  const file = formData.get("cover_image");
  if (file instanceof File && file.size > 0) return uploadNewsImage(file);
  return String(formData.get("cover_image_url") || existing || "").trim() || null;
}

export async function createNewsAction(_: unknown, formData: FormData) {
  const values = valuesFromForm(formData);

  try {
    await requireAdmin();
    await createNewsPost({
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content_html: values.content_html,
      cover_image_url: await coverUrlFromForm(formData),
      status: values.status,
    });
    revalidateNewsViews();
    return state(true, "Noticia guardada.", emptyNewsValues());
  } catch (error) {
    return state(false, error instanceof Error ? error.message : "No se pudo guardar la noticia.", values);
  }
}

export async function updateNewsAction(_: unknown, formData: FormData) {
  const values = valuesFromForm(formData);

  try {
    await requireAdmin();
    const cover_image_url = await coverUrlFromForm(formData, values.cover_image_url);
    await updateNewsPost(values.id || "", {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content_html: values.content_html,
      cover_image_url,
      status: values.status,
    });
    const nextValues = { ...values, cover_image_url: cover_image_url || "" };
    revalidatePath(`/noticias/${values.slug}`);
    revalidateNewsViews();
    return state(true, "Noticia actualizada.", nextValues);
  } catch (error) {
    return state(false, error instanceof Error ? error.message : "No se pudo actualizar la noticia.", values);
  }
}

export async function deleteNewsAction(formData: FormData) {
  await requireAdmin();
  await deleteNewsPost(String(formData.get("id") || ""));
  revalidateNewsViews();
}
