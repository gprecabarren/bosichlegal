import "server-only";

import { createHash } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import type { ContactSubmission, ContactStatus } from "@/types/contact";
import { contactSubmissionsTable, getSupabaseAdmin } from "@/lib/supabase";

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  sourcePath?: string;
  ipHash?: string;
  userAgent?: string;
};

export function hashIp(ip: string) {
  const salt = process.env.CONTACT_IP_SALT || process.env.ADMIN_SESSION_SECRET || "bosich-contact-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function createContactSubmission(input: ContactInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado para recibir casos.");

  const { data, error } = await supabase
    .from(contactSubmissionsTable)
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject,
      message: input.message,
      source_path: input.sourcePath || "/contacto",
      ip_hash: input.ipHash || null,
      user_agent: input.userAgent || null,
      status: "new",
      email_sent: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as ContactSubmission;
}

export async function countRecentSubmissions(ipHash: string | null, email: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { byIp: 0, byEmail: 0 };

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const byIpQuery = ipHash
    ? supabase
        .from(contactSubmissionsTable)
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", fifteenMinutesAgo)
    : null;

  const byEmailQuery = supabase
    .from(contactSubmissionsTable)
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo);

  const [byIp, byEmail] = await Promise.all([byIpQuery, byEmailQuery]);

  return {
    byIp: byIp?.count || 0,
    byEmail: byEmail.count || 0,
  };
}

export async function updateContactEmailStatus(id: string, sent: boolean, errorMessage?: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase
    .from(contactSubmissionsTable)
    .update({
      email_sent: sent,
      email_error: errorMessage || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function listContactSubmissions({ trashed = false, page = 1 } = {}) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado para recibir casos.");
  const pageSize = 40;
  const requestedPage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000000) : 1;
  let query = supabase
    .from(contactSubmissionsTable)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  query = trashed ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, count, error } = await query.range((requestedPage - 1) * pageSize, requestedPage * pageSize - 1);

  if (error?.code === "PGRST103" && requestedPage > 1) return listContactSubmissions({ trashed, page: 1 });
  if (error) throw new Error("No se pudieron cargar las solicitudes. Revisa la conexión y la migración de la papelera.");
  const total = count || 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (requestedPage > lastPage) return listContactSubmissions({ trashed, page: lastPage });
  return { submissions: (data || []) as ContactSubmission[], total, page: requestedPage, pageSize };
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  await requireAdmin();
  if (!["new", "reviewed", "contacted", "archived"].includes(status)) throw new Error("Estado inválido.");
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { data, error } = await supabase
    .from(contactSubmissionsTable)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id).is("deleted_at", null).select("id").single();

  if (error || !data) throw new Error("No se pudo actualizar la solicitud. Puede estar en la papelera.");
}

export async function setContactDeleted(id: string, deleted: boolean) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");
  let query = supabase.from(contactSubmissionsTable).update({
    deleted_at: deleted ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  query = deleted ? query.is("deleted_at", null) : query.not("deleted_at", "is", null);
  const { data, error } = await query.select("id").single();
  if (error || !data) throw new Error("No se pudo cambiar el estado de la solicitud. Actualiza la página.");
}

export async function permanentlyDeleteContact(id: string, confirmation: string) {
  await requireAdmin();
  if (confirmation !== "ELIMINAR") throw new Error("Escribe ELIMINAR para confirmar la eliminación definitiva.");
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data, error } = await supabase.from(contactSubmissionsTable).delete()
    .eq("id", id).not("deleted_at", "is", null).select("id").single();
  if (error || !data) throw new Error("No se pudo eliminar definitivamente la solicitud. Debe estar en la papelera.");
}
