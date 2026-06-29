import "server-only";

import { randomUUID } from "node:crypto";
import type { TeamMember } from "@/types/member";
import type { SiteContent } from "@/types/site";
import { getSupabaseAdmin, membersBucket, membersTable } from "@/lib/supabase";

export function fallbackMembers(content: SiteContent): TeamMember[] {
  return content.about.team.map((member, index) => ({
    id: `fallback-${index}`,
    name: member.name,
    role: member.role,
    focus: member.focus,
    photo_url: member.photo_url || null,
    sort_order: index + 1,
    is_active: true,
  }));
}

export async function listMembers(content?: SiteContent, includeInactive = false) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return content ? fallbackMembers(content) : [];

  let query = supabase
    .from(membersTable)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    if (content) return fallbackMembers(content);
    throw new Error(error.message);
  }
  return (data || []) as TeamMember[];
}

export async function uploadMemberPhoto(file: File) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("La foto debe ser una imagen.");
  if (file.size > 4 * 1024 * 1024) throw new Error("La foto no puede superar 4 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(membersBucket)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(membersBucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function createMember(input: Omit<TeamMember, "id" | "created_at" | "updated_at">) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { error } = await supabase.from(membersTable).insert(input);
  if (error) throw new Error(error.message);
}

export async function updateMember(id: string, input: Partial<Omit<TeamMember, "id" | "created_at" | "updated_at">>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { error } = await supabase
    .from(membersTable)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteMember(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { error } = await supabase.from(membersTable).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
