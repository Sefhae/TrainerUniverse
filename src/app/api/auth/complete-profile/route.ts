import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { getAuthContext, unauthorized } from '@/lib/supabase-auth';
import { authResponse } from '@/lib/auth-helpers';

// POST /api/auth/complete-profile — called once after a brand-new OAuth (Google)
// login, where the user is authenticated but has no app `users` row yet. The
// client sends the chosen role; we create the matching trainer/student profile.
export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  // Already set up? Just return the existing context (idempotent).
  const existing = await getAuthContext(supabase);
  if (existing) return authResponse(existing);

  const body = await req.json().catch(() => ({}));
  const role = body?.role === 'student' ? 'student' : 'trainer';
  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const name = (meta.full_name || meta.name || user.email?.split('@')[0] || 'New user').trim();
  const email = (user.email ?? '').toLowerCase();

  const admin = getAdminSupabase();
  const { data: appUser, error: userError } = await admin
    .from('users')
    .insert({ auth_id: user.id, email, role })
    .select('id')
    .single();
  if (userError || !appUser) {
    return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 });
  }

  if (role === 'student') {
    await admin.from('student_profiles').insert({ user_id: appUser.id, name });
  } else {
    await admin.from('trainer_profiles').insert({ user_id: appUser.id, name, is_published: 1 });
  }

  const ctx = await getAuthContext(supabase);
  if (!ctx) return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 });
  return authResponse(ctx, 201);
}
