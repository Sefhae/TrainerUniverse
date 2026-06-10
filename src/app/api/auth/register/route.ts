import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { getAuthContext } from '@/lib/supabase-auth';
import { authResponse, authErrorResponse, normalizeEmail } from '@/lib/auth-helpers';
import { validatePassword } from '@/lib/password';
import { checkProfanity } from '@/lib/profanity';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password, specialties } = body || {};

    if (!name || !String(name).trim())
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
    if (!email || !EMAIL_RE.test(String(email)))
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    const pwError = validatePassword(String(password ?? ''));
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
    const profanity = checkProfanity(name);
    if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

    const normalizedEmail = normalizeEmail(email);
    const supabase = await getServerSupabase();

    // 1) Create the Supabase Auth user. When "Confirm email" is ON, this sends a
    //    confirmation email and returns NO session; the link points at /auth/callback.
    const { data: signUp, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: String(password),
      options: { emailRedirectTo: `${req.nextUrl.origin}/auth/callback` },
    });
    if (signUpError) return authErrorResponse(signUpError);
    if (!signUp.user) return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });

    // 2) Create the app-side rows with the service-role client so it works even
    //    when there's no session yet (email confirmation on). Idempotent per auth
    //    user, so re-submitting an unconfirmed signup won't duplicate rows.
    const admin = getAdminSupabase();
    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('auth_id', signUp.user.id)
      .maybeSingle();

    if (!existing) {
      const { data: appUser, error: userError } = await admin
        .from('users')
        .insert({ auth_id: signUp.user.id, email: normalizedEmail, role: 'trainer' })
        .select('id')
        .single();
      if (userError || !appUser) throw userError ?? new Error('Could not create user row.');

      const { data: profile, error: profileError } = await admin
        .from('trainer_profiles')
        .insert({ user_id: appUser.id, name: String(name).trim(), is_published: 1 })
        .select('id')
        .single();
      if (profileError || !profile) throw profileError ?? new Error('Could not create profile.');

      if (Array.isArray(specialties) && specialties.length) {
        const { data: specRows } = await admin
          .from('specialties')
          .select('id, name')
          .in('name', specialties.map(String));
        const links = (specRows ?? []).map((s) => ({ trainer_id: profile.id, specialty_id: s.id }));
        if (links.length) await admin.from('trainer_specialties').insert(links);
      }
    }

    // 3a) Email confirmation ON → no session yet. Tell the client to check email.
    if (!signUp.session) {
      return NextResponse.json({ needsConfirmation: true }, { status: 201 });
    }

    // 3b) Confirmation OFF → a session exists, so log the user straight in.
    const ctx = await getAuthContext(supabase);
    if (!ctx) return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
    return authResponse(ctx, 201);
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
