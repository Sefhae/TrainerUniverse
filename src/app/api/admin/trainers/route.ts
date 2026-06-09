import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

export async function GET() {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { data: trainers } = await admin
    .from('trainer_profiles')
    .select('id, name, is_published, is_verified, created_at, user_id, users(email), trainer_specialties(specialties(name))')
    .order('created_at', { ascending: false });

  const { data: enrolments } = await admin.from('trainer_students').select('trainer_id');
  const studentCount = new Map<number, number>();
  for (const e of enrolments ?? []) studentCount.set(e.trainer_id, (studentCount.get(e.trainer_id) ?? 0) + 1);

  const { data: sessions } = await admin.from('training_sessions').select('trainer_id');
  const sessionCount = new Map<number, number>();
  for (const s of sessions ?? []) sessionCount.set(s.trainer_id, (sessionCount.get(s.trainer_id) ?? 0) + 1);

  const rows = (trainers ?? []).map((tp) => {
    const specNames = ((tp.trainer_specialties ?? []) as Array<{ specialties: { name?: string } | { name?: string }[] | null }>)
      .map((ts) => one(ts.specialties)?.name)
      .filter(Boolean);
    return {
      id: tp.id,
      name: tp.name,
      is_published: tp.is_published,
      is_verified: tp.is_verified,
      created_at: tp.created_at,
      email: one(tp.users as { email?: string } | { email?: string }[] | null)?.email,
      specialties: specNames.length ? specNames.join(', ') : null,
      student_count: studentCount.get(tp.id) ?? 0,
      session_count: sessionCount.get(tp.id) ?? 0,
    };
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { name, email, password } = await req.json();
  if (!name || !email || !password || String(password).length < 6) {
    return NextResponse.json({ error: 'Name, email, and password (min 6 chars) are required.' }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const { data: existing } = await admin.from('users').select('id').eq('email', normalizedEmail).maybeSingle();
  if (existing) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });

  // Create the Supabase Auth user (pre-confirmed so they can log in right away).
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password: String(password),
    email_confirm: true,
  });
  if (authError || !authUser.user) {
    return NextResponse.json({ error: authError?.message ?? 'Could not create user.' }, { status: 400 });
  }

  const { data: user } = await admin
    .from('users')
    .insert({ auth_id: authUser.user.id, email: normalizedEmail, role: 'trainer' })
    .select('id')
    .single();
  const { data: trainer } = await admin
    .from('trainer_profiles')
    .insert({ user_id: user!.id, name: String(name).trim(), is_published: 1 })
    .select('id, name, is_published, created_at')
    .single();

  return NextResponse.json(
    {
      id: trainer!.id,
      name: trainer!.name,
      is_published: trainer!.is_published,
      created_at: trainer!.created_at,
      email: normalizedEmail,
      specialties: null,
      student_count: 0,
      session_count: 0,
    },
    { status: 201 }
  );
}
