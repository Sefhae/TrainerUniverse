import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const head = { count: 'exact' as const, head: true };
  const [trainers, published, students, sessions, messages] = await Promise.all([
    admin.from('trainer_profiles').select('*', head),
    admin.from('trainer_profiles').select('*', head).eq('is_published', 1),
    admin.from('student_profiles').select('*', head),
    admin.from('training_sessions').select('*', head),
    admin.from('messages').select('*', head),
  ]);

  return NextResponse.json({
    trainers: trainers.count ?? 0,
    published: published.count ?? 0,
    students: students.count ?? 0,
    sessions: sessions.count ?? 0,
    messages: messages.count ?? 0,
  });
}
