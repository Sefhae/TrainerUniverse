import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized } from '@/lib/supabase-auth';
import { validatePassword } from '@/lib/password';

// PUT /api/account — the logged-in user updates their own email and/or password.
// Email + password now live in Supabase Auth, so we verify the current password
// by re-authenticating, then apply the change via supabase.auth.updateUser().
export async function PUT(req: NextRequest) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();

  const { currentPassword, email, password } = await req.json();

  if (!currentPassword) {
    return NextResponse.json({ error: 'Your current password is required.' }, { status: 400 });
  }
  // Verify the current password by attempting a sign-in with it.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: ctx.email,
    password: String(currentPassword),
  });
  if (verifyError) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });
  }

  const newEmail = (email ?? '').toString().trim().toLowerCase();
  if (newEmail && newEmail !== ctx.email) {
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    const { data: conflict } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail)
      .neq('id', ctx.userId)
      .maybeSingle();
    if (conflict) return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 });

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await supabase.from('users').update({ email: newEmail }).eq('id', ctx.userId);
  }

  if (password) {
    const err = validatePassword(password);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    const { error } = await supabase.auth.updateUser({ password: String(password) });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email: newEmail || ctx.email });
}
