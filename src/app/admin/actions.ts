"use server";

import { revalidatePath } from "next/cache";
import { getSiteContent, saveSiteContent } from "@/lib/content";
import type { SiteContent } from "@/types/site";

function lines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseServices(raw: FormDataEntryValue | null): SiteContent["services"]["items"] {
  return String(raw || "")
    .split("\n\n")
    .map((block) => {
      const [title, ...details] = block.split("\n").map((line) => line.trim()).filter(Boolean);
      return title ? { title, details } : null;
    })
    .filter(Boolean) as SiteContent["services"]["items"];
}

export async function saveAdminContent(_: unknown, formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, message: "Clave admin incorrecta o ADMIN_PASSWORD no configurado." };
  }

  const current = await getSiteContent();
  const whatsapp = String(formData.get("whatsapp") || current.contact.whatsapp).replace(/\D/g, "");
  const email = String(formData.get("email") || current.contact.email);

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
        instagram: String(formData.get("instagram") || ""),
        linkedin: String(formData.get("linkedin") || ""),
        email: `mailto:${email}`,
        whatsapp: `https://wa.me/${whatsapp}`,
      },
    },
    seo: {
      ...current.seo,
      title: String(formData.get("seoTitle") || current.seo.title),
      description: String(formData.get("seoDescription") || current.seo.description),
      keywords: lines(formData.get("keywords")),
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
      paragraphs: lines(formData.get("aboutParagraphs")),
    },
    services: {
      ...current.services,
      items: parseServices(formData.get("services")),
    },
    cta: {
      ...current.cta,
      title: String(formData.get("ctaTitle") || current.cta.title),
      text: String(formData.get("ctaText") || current.cta.text),
      button: String(formData.get("ctaButton") || current.cta.button),
    },
  };

  await saveSiteContent(nextContent);
  ["/", "/servicios", "/ubicacion", "/sobre-nosotros", "/contacto", "/admin"].forEach((path) => {
    revalidatePath(path);
  });

  return { ok: true, message: "Contenido guardado correctamente." };
}

