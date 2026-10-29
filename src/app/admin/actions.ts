"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireAdmin } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/content";
import { normalizeLinkedInProfileUrl } from "@/lib/linkedin";
import type { SiteContent } from "@/types/site";
import { indexingPages } from "@/lib/indexing-pages";

function lines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function socialUrl(base: string, value: FormDataEntryValue | null) {
  const handle = String(value || "").trim().replace(/^\/+|\/+$/g, "");
  return handle ? `https://${base}/${handle}` : "";
}

export async function saveAdminContent(_: unknown, formData: FormData) {
  await requireAdmin();

  const current = await getSiteContent();
  const whatsapp = String(formData.get("whatsapp") || current.contact.whatsapp).replace(/\D/g, "");
  const email = String(formData.get("email") || current.contact.email);
  const linkedin = normalizeLinkedInProfileUrl(String(formData.get("linkedin") || ""));

  if (!linkedin) {
    return { ok: false, message: "Ingresa un perfil personal de LinkedIn con formato https://www.linkedin.com/in/usuario/." };
  }

  const nextContent: SiteContent = {
    ...current,
    contact: {
      ...current.contact,
      phone: String(formData.get("phone") || current.contact.phone),
      whatsapp,
      email,
      addresses: lines(formData.get("addresses")),
      hours: lines(formData.get("hours")),
      social: {
        instagram: socialUrl("instagram.com", formData.get("instagram")),
        linkedin,
        email: `mailto:${email}`,
        whatsapp: `https://wa.me/${whatsapp}`,
      },
    },
    seo: {
      ...current.seo,
      title: String(formData.get("seoTitle") || current.seo.title),
      description: String(formData.get("seoDescription") || current.seo.description),
      keywords: lines(formData.get("keywords")),
      googleSiteVerification: String(formData.get("googleSiteVerification") || "").trim(),
      noindexPaths: formData.get("indexingControlsPresent") === "1" ? indexingPages.filter(page => !formData.getAll("indexablePaths").includes(page.path)).map(page => page.path) : current.seo.noindexPaths,
    },
    integrations: {
      ...current.integrations,
      searchConsoleProperty: String(formData.get("searchConsoleProperty") || "").trim(),
      contactNotifyEmail: String(formData.get("contactNotifyEmail") || "").trim(),
      contactFromEmail: String(formData.get("contactFromEmail") || "").trim(),
      turnstileSiteKey: String(formData.get("turnstileSiteKey") || "").trim(),
      corporateEmailProvider: String(formData.get("corporateEmailProvider") || "").trim(),
      corporateEmailNotes: String(formData.get("corporateEmailNotes") || "").trim(),
    },
    home: {
      ...current.home,
      heroTitle: String(formData.get("heroTitle") || current.home.heroTitle),
      heroSubtitle: String(formData.get("heroSubtitle") || current.home.heroSubtitle),
      introTitle: String(formData.get("introTitle") || current.home.introTitle),
      introText: String(formData.get("introText") || current.home.introText),
    },
    about: {
      ...current.about,
      title: String(formData.get("aboutTitle") || current.about.title),
      paragraphs: lines(formData.get("aboutParagraphs")),
    },
    locations: {
      ...current.locations,
      title: String(formData.get("locationsTitle") || current.locations.title),
    },
    cta: {
      ...current.cta,
      title: String(formData.get("ctaTitle") || current.cta.title),
      text: String(formData.get("ctaText") || current.cta.text),
      button: String(formData.get("ctaButton") || current.cta.button),
    },
  };

  await saveSiteContent(nextContent);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");

  return { ok: true, message: "Contenido guardado correctamente." };
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}
