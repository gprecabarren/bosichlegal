"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createNewsPost, deleteNewsPost, NewsError, permanentlyDeleteNewsPost, restoreNewsPost, updateNewsPost, uploadNewsImage } from "@/lib/news";
import type { NewsActionState, NewsFormValues, NewsMutationState, NewsStatus } from "@/types/news";

function revalidateNewsViews() {
  ["/", "/admin", "/admin/crear-blog", "/noticias", "/sitemap.xml"].forEach((path) => revalidatePath(path));
  revalidatePath("/noticias/[slug]", "page");
}

function friendlyError(error: unknown, fallback: string) {
  if (error instanceof NewsError) return error.message;
  if (error instanceof Error && error.message === "No autorizado") {
    return "Tu sesión ha vencido. Inicia sesión nuevamente para continuar.";
  }
  return fallback;
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
    seo_title: "",
    meta_description: "",
    focus_keyword: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    noindex: false,
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
    seo_title: String(formData.get("seo_title") || ""),
    meta_description: String(formData.get("meta_description") || ""),
    focus_keyword: String(formData.get("focus_keyword") || ""),
    canonical_url: String(formData.get("canonical_url") || ""),
    og_title: String(formData.get("og_title") || ""),
    og_description: String(formData.get("og_description") || ""),
    noindex: formData.get("noindex") === "on",
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
    values.cover_image_url = (await coverUrlFromForm(formData)) || "";
    await createNewsPost({
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content_html: values.content_html,
      cover_image_url: values.cover_image_url,
      status: values.status,
      seo_title: values.seo_title,
      meta_description: values.meta_description,
      focus_keyword: values.focus_keyword,
      canonical_url: values.canonical_url,
      og_title: values.og_title,
      og_description: values.og_description,
      noindex: values.noindex,
    });
    revalidateNewsViews();
    return state(true, "Noticia guardada.", emptyNewsValues());
  } catch (error) {
    return state(false, friendlyError(error, "No se pudo guardar la noticia. Tus datos se conservaron; inténtalo nuevamente."), values);
  }
}

export async function updateNewsAction(_: unknown, formData: FormData) {
  const values = valuesFromForm(formData);

  try {
    await requireAdmin();
    values.cover_image_url = (await coverUrlFromForm(formData, values.cover_image_url)) || "";
    await updateNewsPost(values.id || "", {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content_html: values.content_html,
      cover_image_url: values.cover_image_url,
      status: values.status,
      seo_title: values.seo_title,
      meta_description: values.meta_description,
      focus_keyword: values.focus_keyword,
      canonical_url: values.canonical_url,
      og_title: values.og_title,
      og_description: values.og_description,
      noindex: values.noindex,
    });
    revalidateNewsViews();
    return state(true, "Noticia actualizada.", values);
  } catch (error) {
    return state(false, friendlyError(error, "No se pudo actualizar la noticia. Tus datos se conservaron; inténtalo nuevamente."), values);
  }
}

export async function deleteNewsAction(_: unknown, formData: FormData): Promise<NewsMutationState> {
  try {
    await requireAdmin();
    await deleteNewsPost(String(formData.get("id") || ""));
    revalidateNewsViews();
    return { ok: true, message: "Noticia enviada a la papelera." };
  } catch (error) {
    return { ok: false, message: friendlyError(error, "No se pudo enviar la noticia a la papelera. Inténtalo nuevamente.") };
  }
}

export async function restoreNewsAction(_: unknown, formData: FormData): Promise<NewsMutationState> {
  try {
    await requireAdmin();
    await restoreNewsPost(String(formData.get("id") || ""));
    revalidateNewsViews();
    return { ok: true, message: "Noticia restaurada como borrador. No está publicada." };
  } catch (error) {
    return { ok: false, message: friendlyError(error, "No se pudo restaurar la noticia. Inténtalo nuevamente.") };
  }
}

export async function permanentlyDeleteNewsAction(_: unknown, formData: FormData): Promise<NewsMutationState> {
  try {
    await requireAdmin();
    if (formData.get("confirm_permanent_delete") !== "true") {
      return { ok: false, message: "Confirma la eliminación definitiva de esta noticia para continuar." };
    }
    await permanentlyDeleteNewsPost(String(formData.get("id") || ""));
    revalidateNewsViews();
    return { ok: true, message: "Noticia eliminada definitivamente." };
  } catch (error) {
    return { ok: false, message: friendlyError(error, "No se pudo eliminar la noticia definitivamente. Inténtalo nuevamente.") };
  }
}
