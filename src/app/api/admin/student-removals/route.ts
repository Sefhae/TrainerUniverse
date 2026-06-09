import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

// GET /api/admin/student-removals — list pending student removal requests
export async function GET() {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { data } = await admin
    .from('student_removal_requests')
    .select('id, reason, created_at, trainer_id, student_id, trainer_profiles(name), student_profiles(name, users(email))')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const rows = (data ?? []).map((r) => {
    const sp = one(
      r.student_profiles as
        | { name?: string; users?: { email?: string } | { email?: string }[] }
        | { name?: string; users?: { email?: string } | { email?: string }[] }[]
        | null
    );
    return {
      id: r.id,
      reason: r.reason,
      created_at: r.created_at,
      trainer_id: r.trainer_id,
      student_id: r.student_id,
      trainer_name: one(r.trainer_profiles as { name?: string } | { name?: string }[] | null)?.name,
      student_name: sp?.name,
      student_email: one(sp?.users)?.email,
    };
  });

  return NextResponse.json(rows);
}
