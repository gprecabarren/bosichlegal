import "server-only";

import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
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
    deleted_at: null,
  }));
}

export async function listMembers(content?: SiteContent, includeInactive = false) {
  if (includeInactive) await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return content ? fallbackMembers(content) : [];

  let query = supabase
    .from(membersTable)
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    if (!includeInactive) return [];
    throw new Error("No se pudieron cargar los miembros. Revisa la conexión y la migración de la papelera.");
  }
  return (data || []) as TeamMember[];
}

export async function listTrashedMembers() {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase.from(membersTable).select("*")
    .not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  if (error) throw new Error("No se pudo cargar la papelera de miembros. Revisa la conexión y la migración de la papelera.");
  return (data || []) as TeamMember[];
}

export async function uploadMemberPhoto(file: File) {
  await requireAdmin();
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

  if (error) throw new Error("No se pudo cargar la foto. Inténtalo nuevamente.");

  const { data } = supabase.storage.from(membersBucket).getPublicUrl(path);
  return data.publicUrl;
}

type MemberInput = Omit<TeamMember, "id" | "created_at" | "updated_at" | "deleted_at">;

export async function createMember(input: MemberInput) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { error } = await supabase.from(membersTable).insert({ ...input, deleted_at: null });
  if (error?.code === "23505") throw new Error("Ya existe un miembro con ese nombre y cargo, también puede estar en la papelera.");
  if (error) throw new Error("No se pudo crear el miembro. Inténtalo nuevamente.");
}

export async function updateMember(id: string, input: Partial<MemberInput>) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { data, error } = await supabase
    .from(membersTable)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id).is("deleted_at", null).select("id").single();
  if (error?.code === "23505") throw new Error("Ya existe un miembro con ese nombre y cargo, también puede estar en la papelera.");
  if (error || !data) throw new Error("No se pudo guardar el miembro. Puede estar en la papelera o haber sido eliminado.");
}

export async function deleteMember(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const now = new Date().toISOString();
  const { data, error } = await supabase.from(membersTable)
    .update({ deleted_at: now, is_active: false, updated_at: now })
    .eq("id", id).is("deleted_at", null).select("id").single();
  if (error || !data) throw new Error("No se pudo enviar el miembro a la papelera. Actualiza la página e inténtalo nuevamente.");
}

export async function restoreMember(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { data, error } = await supabase.from(membersTable)
    .update({ deleted_at: null, is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id).not("deleted_at", "is", null).select("id").single();
  if (error?.code === "23505") throw new Error("Ya existe un miembro con ese nombre y cargo.");
  if (error || !data) throw new Error("No se pudo restaurar el miembro. Debe estar en la papelera.");
}

export async function permanentlyDeleteMember(id: string, confirmation: string) {
  await requireAdmin();
  if (confirmation !== "ELIMINAR") throw new Error("Escribe ELIMINAR para confirmar la eliminación definitiva.");
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { data, error } = await supabase.from(membersTable).delete()
    .eq("id", id).not("deleted_at", "is", null).select("id").single();
  if (error || !data) throw new Error("No se pudo eliminar definitivamente el miembro. Debe estar en la papelera.");
}
