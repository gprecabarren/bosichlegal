import "server-only";

import { createHash } from "node:crypto";
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

export async function listContactSubmissions() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(contactSubmissionsTable)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) return [];
  return (data || []) as ContactSubmission[];
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { error } = await supabase
    .from(contactSubmissionsTable)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
