import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import type { ServerSupabase } from '@/lib/supabase-server';

const SESSION_SELECT =
  '*, student_profiles(name), trainer_profiles(name), session_change_requests(id, requested_by, proposed_at, message, status, created_at)';

type Embedded = Record<string, unknown> & {
  student_profiles?: { name?: string } | { name?: string }[] | null;
  trainer_profiles?: { name?: string } | { name?: string }[] | null;
  session_change_requests?: Array<Record<string, unknown>> | null;
};

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

function mapSession(r: Embedded) {
  const sp = one(r.student_profiles);
  const tp = one(r.trainer_profiles);
  const cr = (r.session_change_requests ?? []).find((c) => c.status === 'pending') ?? null;
  return {
    id: r.id,
    trainerId: r.trainer_id,
    studentId: r.student_id,
    studentName: sp?.name,
    trainerName: tp?.name,
    title: r.title,
    scheduledAt: r.scheduled_at,
    durationMin: r.duration_min,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    pendingChangeRequest: cr
      ? {
          id: cr.id,
          sessionId: r.id,
          requestedBy: cr.requested_by,
          proposedAt: cr.proposed_at,
          message: cr.message,
          status: cr.status,
          createdAt: cr.created_at,
        }
      : null,
  };
}

async function listSessions(sb: ServerSupabase, column: 'trainer_id' | 'student_id', value: number) {
  const { data } = await sb
    .from('training_sessions')
    .select(SESSION_SELECT)
    .eq(column, value)
    .order('scheduled_at', { ascending: true });
  return ((data ?? []) as unknown as Embedded[]).map(mapSession);
}

// GET /api/sessions — sessions for the authenticated user (trainer or student)
export async function GET() {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();

  if (ctx.role === 'trainer' && ctx.trainerId) {
    return NextResponse.json(await listSessions(supabase, 'trainer_id', ctx.trainerId));
  }
  if (ctx.role === 'student' && ctx.studentId) {
    return NextResponse.json(await listSessions(supabase, 'student_id', ctx.studentId));
  }
  return forbidden();
}

// POST /api/sessions — create a session (trainer only)
export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();

  const { studentId, title, scheduledAt, durationMin, notes } = await req.json();
  if (!studentId || !scheduledAt) {
    return NextResponse.json({ error: 'studentId and scheduledAt are required.' }, { status: 400 });
  }

  const { data: enrolled } = await supabase
    .from('trainer_students')
    .select('student_id')
    .eq('trainer_id', ctx.trainerId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!enrolled) {
    return NextResponse.json({ error: 'Student not enrolled with this trainer.' }, { status: 403 });
  }

  const { data: created, error } = await supabase
    .from('training_sessions')
    .insert({
      trainer_id: ctx.trainerId,
      student_id: studentId,
      title: title?.trim() || 'Training Session',
      scheduled_at: scheduledAt,
      duration_min: durationMin || 60,
      notes: notes?.trim() || '',
    })
    .select('id')
    .single();
  if (error || !created) return NextResponse.json({ error: 'Could not create session.' }, { status: 500 });
  return NextResponse.json({ id: created.id });
}
