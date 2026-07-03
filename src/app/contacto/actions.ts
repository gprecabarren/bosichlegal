"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSiteContent } from "@/lib/content";
import {
  countRecentSubmissions,
  createContactSubmission,
  hashIp,
  updateContactEmailStatus,
} from "@/lib/contact-submissions";
import { notifyContactSubmission } from "@/lib/contact-email";

type ContactState = {
  ok: boolean;
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: FormDataEntryValue | null, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function clientIp(headersList: Headers) {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (ip !== "unknown") body.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });

  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return Boolean(result.success);
}

export async function submitContactCase(_: ContactState | null, formData: FormData): Promise<ContactState> {
  const startedAt = Number(formData.get("startedAt") || 0);
  const honeypot = clean(formData.get("company"));

  if (honeypot) {
    return { ok: true, message: "Gracias. Recibimos tu solicitud." };
  }

  if (!startedAt || Date.now() - startedAt < 3500) {
    return { ok: false, message: "Espera unos segundos antes de enviar el formulario." };
  }

  const name = clean(formData.get("name"), 90);
  const email = clean(formData.get("email"), 160).toLowerCase();
  const phone = clean(formData.get("phone"), 40);
  const subject = clean(formData.get("subject"), 120);
  const message = clean(formData.get("message"), 2800);
  const sourcePath = clean(formData.get("sourcePath"), 140) || "/contacto";
  const accepted = formData.get("privacy") === "on";

  if (name.length < 2) return { ok: false, message: "Ingresa tu nombre." };
  if (!emailPattern.test(email)) return { ok: false, message: "Ingresa un correo válido." };
  if (subject.length < 3) return { ok: false, message: "Selecciona o indica la materia." };
  if (message.length < 20) return { ok: false, message: "Cuéntanos un poco más del caso." };
  if (!accepted) return { ok: false, message: "Debes autorizar el contacto para poder responderte." };

  const headersList = await headers();
  const ip = clientIp(headersList);
  const ipHash = ip !== "unknown" ? hashIp(ip) : null;
  const token = clean(formData.get("cf-turnstile-response"), 3000);

  if (!(await verifyTurnstile(token, ip))) {
    return { ok: false, message: "No pudimos validar la protección antispam. Intenta nuevamente." };
  }

  const recent = await countRecentSubmissions(ipHash, email);
  if (recent.byIp >= 4 || recent.byEmail >= 3) {
    return { ok: false, message: "Recibimos varias solicitudes recientes. Intenta nuevamente más tarde." };
  }

  try {
    const content = await getSiteContent();
    const submission = await createContactSubmission({
      name,
      email,
      phone,
      subject,
      message,
      sourcePath,
      ipHash: ipHash || undefined,
      userAgent: clean(headersList.get("user-agent"), 500),
    });

    const emailResult = await notifyContactSubmission(submission, content);
    if (!emailResult.skipped) {
      await updateContactEmailStatus(submission.id, !emailResult.error, emailResult.error || undefined);
    }

    revalidatePath("/admin");
    return { ok: true, message: "Gracias. Recibimos tu caso y te contactaremos a la brevedad." };
  } catch {
    return { ok: false, message: "No pudimos guardar tu solicitud. Escríbenos por WhatsApp o intenta nuevamente." };
  }
}
