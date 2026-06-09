import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

type Params = { params: Promise<{ id: string }> };

// POST /api/sessions/[id]/change-requests — submit a reschedule request
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();

  const { id } = await params;
  const sessionId = Number(id);

  const { data: session } = await supabase
    .from('training_sessions')
    .select('id, trainer_id, student_id')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const isTrainer = ctx.role === 'trainer' && ctx.trainerId === session.trainer_id;
  const isStudent = ctx.role === 'student' && ctx.studentId === session.student_id;
  if (!isTrainer && !isStudent) return forbidden();

  const { proposedAt, message } = await req.json();
  if (!proposedAt) return NextResponse.json({ error: 'proposedAt is required.' }, { status: 400 });

  // Cancel any existing pending request first.
  await supabase
    .from('session_change_requests')
    .update({ status: 'rejected' })
    .eq('session_id', sessionId)
    .eq('status', 'pending');

  const { data: created, error } = await supabase
    .from('session_change_requests')
    .insert({
      session_id: sessionId,
      requested_by: ctx.role,
      proposed_at: proposedAt,
      message: message?.trim() || '',
    })
    .select('id')
    .single();
  if (error || !created) return NextResponse.json({ error: 'Could not submit request.' }, { status: 500 });
  return NextResponse.json({ id: created.id });
}
