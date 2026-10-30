import "server-only";

import { cache } from "react";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Property, PropertyInput } from "@/types/property";

export const propertiesTable = "properties";
export const propertyImagesBucket = "property-images";

function configuredClient() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error("Supabase no está configurado para administrar propiedades.");
  return client;
}

export function isPropertyImageUrl(value: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return false;
  try {
    const url = new URL(value);
    const prefix = `/storage/v1/object/public/${propertyImagesBucket}/`;
    return url.origin === new URL(baseUrl).origin && url.pathname.startsWith(prefix)
      && /^[a-f0-9-]+\.(jpg|png|webp)$/.test(url.pathname.slice(prefix.length))
      && !url.search && !url.hash;
  } catch { return false; }
}

export const listPublicProperties = cache(async (): Promise<Property[]> => {
  const client = getSupabaseAdmin();
  if (!client) return [];
  const { data, error } = await client.from(propertiesTable).select("*")
    .in("status", ["published", "sold"]).is("deleted_at", null).order("created_at", { ascending: false });
  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") return [];
    throw new Error("No se pudieron cargar las propiedades. Inténtalo nuevamente.");
  }
  return (data || []) as Property[];
});

export const getPublicProperty = cache(async (slug: string): Promise<Property | null> => {
  const client = getSupabaseAdmin();
  if (!client) return null;
  const { data, error } = await client.from(propertiesTable).select("*").eq("slug", slug)
    .in("status", ["published", "sold"]).is("deleted_at", null).maybeSingle();
  if (error) throw new Error("No se pudo cargar la propiedad.");
  return data as Property | null;
});

export async function listAdminProperties() {
  await requireAdmin();
  const { data, error } = await configuredClient().from(propertiesTable).select("*").order("created_at", { ascending: false });
  if (error) throw new Error("No se pudo consultar la tabla de propiedades. Revisa la conexión y la migración de Supabase.");
  return (data || []) as Property[];
}

export async function getAdminProperty(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await configuredClient().from(propertiesTable).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("No se pudo cargar la propiedad.");
  return data as Property | null;
}

export async function saveProperty(id: string | null, input: PropertyInput) {
  await requireAdmin();
  if (input.images.some((image) => !isPropertyImageUrl(image.url))) throw new Error("Usa fotografías cargadas desde este panel.");
  const client = configuredClient();
  const query = id ? client.from(propertiesTable).update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).is("deleted_at", null)
    : client.from(propertiesTable).insert(input);
  const { data, error } = await query.select("*").single();
  if (error?.code === "23505") throw new Error("Ya existe una propiedad con ese enlace. Cambia el enlace e intenta guardar nuevamente.");
  if (error || !data) throw new Error("No se pudo guardar la propiedad. Los datos del formulario se conservaron.");
  return data as Property;
}

export async function setPropertyDeleted(id: string, deleted: boolean) {
  await requireAdmin();
  let query = configuredClient().from(propertiesTable).update({
    deleted_at: deleted ? new Date().toISOString() : null,
    status: "draft",
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  query = deleted ? query.is("deleted_at", null) : query.not("deleted_at", "is", null);
  const { data, error } = await query.select("id").single();
  if (error || !data) throw new Error("No se pudo cambiar el estado de la propiedad.");
}

export async function permanentlyDeleteProperty(id: string) {
  await requireAdmin();
  const { data, error } = await configuredClient().from(propertiesTable).delete()
    .eq("id", id).not("deleted_at", "is", null).select("id").single();
  if (error || !data) throw new Error("Solo se pueden eliminar definitivamente propiedades que están en la papelera.");
}

export async function uploadPropertyImage(file: File) {
  await requireAdmin();
  if (!file.size || file.size > 4 * 1024 * 1024) throw new Error("Cada imagen debe pesar como máximo 4 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const formats = [
    { type: "image/jpeg", extension: "jpg", matches: bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
    { type: "image/png", extension: "png", matches: bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
    { type: "image/webp", extension: "webp", matches: bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" },
  ];
  const format = formats.find((item) => item.matches && item.type === file.type);
  if (!format) throw new Error("Selecciona una imagen JPG, PNG o WebP válida.");
  const client = configuredClient();
  const filename = `${randomUUID()}.${format.extension}`;
  const { error } = await client.storage.from(propertyImagesBucket).upload(filename, bytes, { contentType: format.type, upsert: false });
  if (error) throw new Error("No se pudo cargar la imagen. Revisa el almacenamiento de propiedades en Supabase.");
  return client.storage.from(propertyImagesBucket).getPublicUrl(filename).data.publicUrl;
}
