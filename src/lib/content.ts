import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteContent } from "@/types/site";

const contentPath = path.join(process.cwd(), "content", "site.json");
const table = process.env.SUPABASE_CONTENT_TABLE || "site_content";

async function readLocalContent() {
  const raw = await readFile(contentPath, "utf8");
  return JSON.parse(raw) as SiteContent;
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function getSiteContent(): Promise<SiteContent> {
  const config = supabaseConfig();

  if (!config) {
    return readLocalContent();
  }

  const fallback = await readLocalContent();
  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from(table)
    .select("content")
    .eq("id", "main")
    .single();

  if (error || !data?.content || Object.keys(data.content).length === 0) {
    return fallback;
  }

  return data.content as SiteContent;
}

export async function saveSiteContent(content: SiteContent) {
  const config = supabaseConfig();

  if (!config) {
    await writeFile(contentPath, JSON.stringify(content, null, 2), "utf8");
    return { mode: "local" as const };
  }

  const supabase = createClient(config.url, config.key, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from(table).upsert({
    id: "main",
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return { mode: "supabase" as const };
}

export function siteUrl() {
  return process.env.SITE_URL || "https://bosichlegal.cl";
}

