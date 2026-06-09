import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
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

    // 1) Create the Supabase Auth user (this also sets the session cookies when
    //    email confirmation is disabled — see SUPABASE_SETUP.md, step 4).
    const { data: signUp, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: String(password),
    });
    if (signUpError) return authErrorResponse(signUpError);
    if (!signUp.user) return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
    if (!signUp.session)
      return NextResponse.json({ error: 'Please confirm your email, then sign in.' }, { status: 200 });

    // 2) Create the app-side user row linked to the auth user.
    const { data: appUser, error: userError } = await supabase
      .from('users')
      .insert({ auth_id: signUp.user.id, email: normalizedEmail, role: 'trainer' })
      .select('id')
      .single();
    if (userError || !appUser) throw userError ?? new Error('Could not create user row.');

    // 3) Publish the trainer profile immediately (matches the old flow).
    const { data: profile, error: profileError } = await supabase
      .from('trainer_profiles')
      .insert({ user_id: appUser.id, name: String(name).trim(), is_published: 1 })
      .select('id')
      .single();
    if (profileError || !profile) throw profileError ?? new Error('Could not create profile.');

    // 4) Link chosen specialties (unknown names are simply skipped).
    if (Array.isArray(specialties) && specialties.length) {
      const { data: specRows } = await supabase
        .from('specialties')
        .select('id, name')
        .in('name', specialties.map(String));
      const links = (specRows ?? []).map((s) => ({ trainer_id: profile.id, specialty_id: s.id }));
      if (links.length) await supabase.from('trainer_specialties').insert(links);
    }

    const ctx = await getAuthContext(supabase);
    if (!ctx) return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
    return authResponse(ctx, 201);
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
