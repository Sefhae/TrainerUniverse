import { NextResponse } from 'next/server';
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

  const { data: students } = await admin
    .from('student_profiles')
    .select('id, name, created_at, users(email)')
    .order('created_at', { ascending: false });

  // First trainer name per student (LIMIT 1 in the original), computed in JS.
  const { data: enrolments } = await admin
    .from('trainer_students')
    .select('student_id, trainer_profiles(name)');
  const firstTrainer = new Map<number, string>();
  for (const e of enrolments ?? []) {
    if (!firstTrainer.has(e.student_id)) {
      const tp = one(e.trainer_profiles as { name?: string } | { name?: string }[] | null);
      if (tp?.name) firstTrainer.set(e.student_id, tp.name);
    }
  }

  // Session counts per student.
  const { data: sessions } = await admin.from('training_sessions').select('student_id');
  const sessionCount = new Map<number, number>();
  for (const s of sessions ?? []) {
    sessionCount.set(s.student_id, (sessionCount.get(s.student_id) ?? 0) + 1);
  }

  const rows = (students ?? []).map((sp) => ({
    id: sp.id,
    name: sp.name,
    created_at: sp.created_at,
    email: one(sp.users as { email?: string } | { email?: string }[] | null)?.email,
    trainer_name: firstTrainer.get(sp.id) ?? null,
    session_count: sessionCount.get(sp.id) ?? 0,
  }));

  return NextResponse.json(rows);
}
