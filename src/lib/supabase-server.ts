import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

/**
 * The cookie-bound Supabase client for use inside Route Handlers / Server
 * Components. It carries the logged-in user's session (read from cookies), so
 * every query runs under that user's RLS context. Calling `auth.signInWith…`
 * or `signOut` on it also writes the session cookies onto the response.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export type ServerSupabase = Awaited<ReturnType<typeof getServerSupabase>>;
