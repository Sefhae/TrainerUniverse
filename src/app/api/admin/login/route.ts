import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext } from '@/lib/supabase-auth';
import { authErrorResponse, normalizeEmail } from '@/lib/auth-helpers';

// Admin is now a normal Supabase Auth account whose app `users.role` is 'admin'.
// See SUPABASE_SETUP.md (step 6) for how to create it.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password: String(password),
  });
  if (error) return authErrorResponse(error);

  const ctx = await getAuthContext(supabase);
  if (!ctx || ctx.role !== 'admin') {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
