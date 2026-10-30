"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/content";
import { getStaticPage, patchPageContent, patchPageSeo, validatePageContent, validatePageSeo } from "@/lib/page-content";

export async function saveStaticPageAction(_: unknown, data: FormData) {
  try {
    await requireAdmin();
    const page = getStaticPage(String(data.get("pageId") || ""));
    if (!page) throw new Error("La página no existe.");
    const patch: unknown = JSON.parse(String(data.get("content") || "{}"));
    const seo: unknown = JSON.parse(String(data.get("seo") || "{}"));
    validatePageContent(page.path, patch);
    validatePageSeo(seo);
    const current = await getSiteContent();
    await saveSiteContent(patchPageSeo(patchPageContent(current, page.path, patch), page.path, seo));
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    return { ok: true, message: "Textos y SEO guardados correctamente." };
  } catch (error) {
    const message = error instanceof Error && !/permission|database|fetch|json|syntax/i.test(error.message)
      ? error.message : "No se pudo guardar. Los campos se conservaron; inténtalo nuevamente.";
    return { ok: false, message };
  }
}
