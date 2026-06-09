import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext } from '@/lib/supabase-auth';
import { authResponse, authErrorResponse, normalizeEmail } from '@/lib/auth-helpers';
import { validatePassword } from '@/lib/password';
import { checkProfanity } from '@/lib/profanity';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (!email?.includes('@'))
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    const pwError = validatePassword(String(password ?? ''));
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
    const profanity = checkProfanity(name);
    if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

    const normalizedEmail = normalizeEmail(email);
    const supabase = await getServerSupabase();

    const { data: signUp, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: String(password),
    });
    if (signUpError) return authErrorResponse(signUpError);
    if (!signUp.user) return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
    if (!signUp.session)
      return NextResponse.json({ error: 'Please confirm your email, then sign in.' }, { status: 200 });

    const { data: appUser, error: userError } = await supabase
      .from('users')
      .insert({ auth_id: signUp.user.id, email: normalizedEmail, role: 'student' })
      .select('id')
      .single();
    if (userError || !appUser) throw userError ?? new Error('Could not create user row.');

    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .insert({ user_id: appUser.id, name: name.trim() })
      .select('id')
      .single();
    if (profileError || !profile) throw profileError ?? new Error('Could not create profile.');

    const ctx = await getAuthContext(supabase);
    if (!ctx) return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
    return authResponse(ctx, 201);
  } catch (err) {
    console.error('student-register error', err);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
