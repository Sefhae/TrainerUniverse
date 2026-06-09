import { NextRequest } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized } from '@/lib/supabase-auth';
import { authResponse, authErrorResponse, normalizeEmail } from '@/lib/auth-helpers';

// Works for any role — getAuthContext resolves trainer vs. student from the
// app `users` row, so the same endpoint serves both login forms.
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
  if (!ctx) return unauthorized('Account not found.');
  return authResponse(ctx);
}
