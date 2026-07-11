import "server-only";

import { randomUUID } from "node:crypto";
import type { NewsPost, NewsStatus } from "@/types/news";
import { getSupabaseAdmin, newsImagesBucket, newsPostsTable } from "@/lib/supabase";

const allowedTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "u",
  "ul",
]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function sanitizeUrl(value: string) {
  const trimmed = value.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  return "";
}

function sanitizeImageUrl(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("/") || trimmed.startsWith("https://") || trimmed.startsWith("http://") ? trimmed : "";
}

function sanitizeStyle(value: string) {
  const declarations = value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const safe = declarations.filter((part) =>
    /^font-size:\s*(?:0?\.\d+|\d+(?:\.\d+)?)(?:rem|em|px|%)$/i.test(part) ||
    /^text-align:\s*(?:left|center|right|justify)$/i.test(part)
  );
  return safe.join("; ");
}

function sanitizeAttributes(tag: string, rawAttributes: string) {
  const attributes: string[] = [];
  const matches = rawAttributes.matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g);

  for (const match of matches) {
    const name = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    if (name.startsWith("on")) continue;

    if (tag === "a" && name === "href") {
      const href = sanitizeUrl(value);
      if (href) attributes.push(`href="${escapeAttribute(href)}"`);
      continue;
    }

    if (tag === "img" && name === "src") {
      const src = sanitizeImageUrl(value);
      if (src) attributes.push(`src="${escapeAttribute(src)}"`);
      continue;
    }

    if (tag === "img" && name === "alt") {
      attributes.push(`alt="${escapeAttribute(value).slice(0, 160)}"`);
      continue;
    }

    if (name === "class" && tag === "figure") {
      const safeClasses = value
        .split(/\s+/)
        .filter((item) => ["news-image-align-left", "news-image-align-center", "news-image-align-right"].includes(item));
      if (safeClasses.length) attributes.push(`class="${safeClasses.join(" ")}"`);
      continue;
    }

    if (name === "class" && tag === "img") {
      const safeClasses = value
        .split(/\s+/)
        .filter((item) => ["news-image-size-small", "news-image-size-medium", "news-image-size-large", "news-image-size-full"].includes(item));
      if (safeClasses.length) attributes.push(`class="${safeClasses.join(" ")}"`);
      continue;
    }

    if (tag === "span" && name === "style") {
      const style = sanitizeStyle(value);
      if (style) attributes.push(`style="${escapeAttribute(style)}"`);
      continue;
    }

    if (name === "target" && tag === "a") {
      attributes.push('target="_blank" rel="noreferrer"');
    }
  }

  if (tag === "a" && !attributes.some((attr) => attr.startsWith("href="))) return "";
  if (tag === "img" && !attributes.some((attr) => attr.startsWith("src="))) return "";
  if (tag === "img") attributes.push('loading="lazy"');

  return attributes.length ? ` ${attributes.join(" ")}` : "";
}

export function sanitizeNewsHtml(html: string) {
  const withoutDangerousBlocks = html
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?\s*>/gi, "");

  return withoutDangerousBlocks.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (full, rawTag, rawAttributes) => {
    const originalTag = String(rawTag).toLowerCase();
    const tag = originalTag === "div" ? "p" : originalTag;
    if (!allowedTags.has(tag)) return "";
    if (full.startsWith("</")) return `</${tag}>`;
    const attrs = sanitizeAttributes(tag, String(rawAttributes || ""));
    if ((tag === "a" || tag === "img") && !attrs) return "";
    return `<${tag}${attrs}>`;
  });
}

export function textFromHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 88);
}

async function ensureUniqueSlug(baseSlug: string, currentId?: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const cleanBase = baseSlug || `noticia-${Date.now()}`;
  let candidate = cleanBase;
  let suffix = 2;

  while (true) {
    let query = supabase.from(newsPostsTable).select("id").eq("slug", candidate).limit(1);
    if (currentId) query = query.neq("id", currentId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return candidate;
    candidate = `${cleanBase}-${suffix}`;
    suffix += 1;
  }
}

export async function listNewsPosts(options: { includeDrafts?: boolean; limit?: number } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from(newsPostsTable)
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!options.includeDrafts) query = query.eq("status", "published");
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) return [];
  return (data || []) as NewsPost[];
}

export async function getNewsPostBySlug(slug: string, includeDrafts = false) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  let query = supabase.from(newsPostsTable).select("*").eq("slug", slug).limit(1);
  if (!includeDrafts) query = query.eq("status", "published");

  const { data, error } = await query.single();
  if (error || !data) return null;
  return data as NewsPost;
}

export async function uploadNewsImage(file: File) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");
  if (!file || file.size === 0) return null;
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (!extensions[file.type]) throw new Error("La imagen debe ser JPG, PNG o WebP.");
  if (file.size > 4 * 1024 * 1024) throw new Error("La imagen no puede superar 4 MB.");

  const extension = extensions[file.type];
  const path = `${randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage.from(newsImagesBucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(newsImagesBucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function createNewsPost(input: {
  title: string;
  slug?: string;
  excerpt?: string;
  content_html: string;
  cover_image_url?: string | null;
  status: NewsStatus;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const title = input.title.trim();
  if (title.length < 4) throw new Error("El título debe tener al menos 4 caracteres.");

  const content_html = sanitizeNewsHtml(input.content_html);
  if (textFromHtml(content_html).length < 40) throw new Error("La noticia necesita un contenido más completo.");

  const slug = await ensureUniqueSlug(slugify(input.slug || title));
  const published_at = input.status === "published" ? new Date().toISOString() : null;
  const { error } = await supabase.from(newsPostsTable).insert({
    title,
    slug,
    excerpt: input.excerpt?.trim() || textFromHtml(content_html).slice(0, 180),
    content_html,
    cover_image_url: input.cover_image_url || null,
    status: input.status,
    published_at,
  });

  if (error) throw new Error(error.message);
}

export async function updateNewsPost(id: string, input: {
  title: string;
  slug?: string;
  excerpt?: string;
  content_html: string;
  cover_image_url?: string | null;
  status: NewsStatus;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const current = await supabase.from(newsPostsTable).select("published_at").eq("id", id).single();
  if (current.error) throw new Error(current.error.message);

  const title = input.title.trim();
  if (title.length < 4) throw new Error("El título debe tener al menos 4 caracteres.");

  const content_html = sanitizeNewsHtml(input.content_html);
  if (textFromHtml(content_html).length < 40) throw new Error("La noticia necesita un contenido más completo.");

  const slug = await ensureUniqueSlug(slugify(input.slug || title), id);
  const published_at =
    input.status === "published"
      ? current.data?.published_at || new Date().toISOString()
      : null;

  const { error } = await supabase
    .from(newsPostsTable)
    .update({
      title,
      slug,
      excerpt: input.excerpt?.trim() || textFromHtml(content_html).slice(0, 180),
      content_html,
      cover_image_url: input.cover_image_url || null,
      status: input.status,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteNewsPost(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const { error } = await supabase.from(newsPostsTable).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
