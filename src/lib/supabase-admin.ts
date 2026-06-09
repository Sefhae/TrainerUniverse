import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for admin-only server code. It bypasses Row
 * Level Security and can manage Supabase Auth users (reset passwords, delete
 * accounts), which the anon/publishable key cannot do for other users.
 *
 * NEVER import this into client components — the service key must stay on the
 * server. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase Dashboard →
 * Project Settings → API → service_role key). See SUPABASE_SETUP.md, step 6.
 */
export function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set — it is required for admin operations.'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
