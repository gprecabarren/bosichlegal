import { AdminNews } from "../../AdminNews";
import { listAdminNewsPosts } from "@/lib/news";
import { hasSupabaseAdminConfig } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import type { NewsPost } from "@/types/news";

export const dynamic = "force-dynamic";

export default async function CreateBlogPage() {
  await requireAdmin();
  const supabaseReady = hasSupabaseAdminConfig();
  let posts: NewsPost[] = [];
  let loadError = "";
  if (supabaseReady) {
    try {
      posts = await listAdminNewsPosts();
    } catch {
      loadError = "No se pudieron cargar las noticias. Revisa la conexión y la migración de noticias e inténtalo nuevamente.";
    }
  }

  return <AdminNews posts={posts} supabaseReady={supabaseReady} loadError={loadError} />;
}
