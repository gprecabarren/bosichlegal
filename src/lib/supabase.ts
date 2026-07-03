import "server-only";

import { createClient } from "@supabase/supabase-js";

export const membersTable = process.env.SUPABASE_MEMBERS_TABLE || "team_members";
export const membersBucket = process.env.SUPABASE_MEMBERS_BUCKET || "team-member-photos";
export const contactSubmissionsTable = process.env.SUPABASE_CONTACT_SUBMISSIONS_TABLE || "contact_submissions";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
