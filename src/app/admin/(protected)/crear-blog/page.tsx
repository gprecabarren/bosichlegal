import { AdminNews } from "../../AdminNews";
import { listNewsPosts } from "@/lib/news";
import { hasSupabaseAdminConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CreateBlogPage() {
  const [posts, supabaseReady] = await Promise.all([
    listNewsPosts({ includeDrafts: true }),
    Promise.resolve(hasSupabaseAdminConfig()),
  ]);

  return <AdminNews posts={posts} supabaseReady={supabaseReady} />;
}
