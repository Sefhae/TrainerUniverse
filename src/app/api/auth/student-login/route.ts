import { NextRequest } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized } from '@/lib/supabase-auth';
import { authResponse, authErrorResponse, normalizeEmail } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body || {};
  if (!email || !password) {
    return unauthorized('Email and password are required.');
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password: String(password),
  });
  if (error) return authErrorResponse(error);

  const ctx = await getAuthContext(supabase);
  // This endpoint is only for student accounts.
  if (!ctx || ctx.role !== 'student') {
    await supabase.auth.signOut();
    return unauthorized('Invalid email or password.');
  }
  return authResponse(ctx);
}
