import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized } from '@/lib/supabase-auth';
import { authResponse } from '@/lib/auth-helpers';

// Hydrates the client from the Supabase session cookie on page load.
export async function GET() {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  return authResponse(ctx);
}
