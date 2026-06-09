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

  const { data } = await admin
    .from('training_sessions')
    .select('id, title, scheduled_at, duration_min, status, notes, created_at, trainer_profiles(name), student_profiles(name)')
    .order('scheduled_at', { ascending: false });

  const rows = (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    scheduled_at: r.scheduled_at,
    duration_min: r.duration_min,
    status: r.status,
    notes: r.notes,
    created_at: r.created_at,
    trainer_name: one(r.trainer_profiles as { name?: string } | { name?: string }[] | null)?.name,
    student_name: one(r.student_profiles as { name?: string } | { name?: string }[] | null)?.name,
  }));

  return NextResponse.json(rows);
}
