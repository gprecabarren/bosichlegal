import "server-only";

import type { SiteContent } from "@/types/site";
import type { ContactSubmission } from "@/types/contact";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function submissionHtml(submission: ContactSubmission) {
  return `
    <h2>Nuevo caso recibido en Bosich Legal</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(submission.name)}</p>
    <p><strong>Correo:</strong> ${escapeHtml(submission.email)}</p>
    <p><strong>Teléfono:</strong> ${escapeHtml(submission.phone || "No informado")}</p>
    <p><strong>Materia:</strong> ${escapeHtml(submission.subject)}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(submission.message).replaceAll("\n", "<br />")}</p>
  `;
}

export async function notifyContactSubmission(submission: ContactSubmission, content: SiteContent) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, error: "RESEND_API_KEY no configurada" };

  const to = process.env.CONTACT_NOTIFY_EMAIL || content.contact.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Bosich Legal <contacto@bosichlegal.cl>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "bosichlegal.cl/1.0",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: submission.email,
      subject: `Nuevo caso desde bosichlegal.cl: ${submission.subject}`,
      html: submissionHtml(submission),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { skipped: false, error: text.slice(0, 500) };
  }

  return { skipped: false, error: null };
}
