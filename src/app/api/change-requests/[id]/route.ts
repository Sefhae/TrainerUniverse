import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

type Params = { params: Promise<{ id: string }> };

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

// PUT /api/change-requests/[id] — approve or reject a change request
export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();

  const { id } = await params;
  const { data: cr } = await supabase
    .from('session_change_requests')
    .select('id, session_id, proposed_at, requested_by, training_sessions(trainer_id, student_id)')
    .eq('id', Number(id))
    .maybeSingle();
  if (!cr) return NextResponse.json({ error: 'Change request not found.' }, { status: 404 });

  const session = one(cr.training_sessions as { trainer_id: number; student_id: number } | { trainer_id: number; student_id: number }[] | null);
  const isTrainer = ctx.role === 'trainer' && ctx.trainerId === session?.trainer_id;
  const isStudent = ctx.role === 'student' && ctx.studentId === session?.student_id;
  if (!isTrainer && !isStudent) return forbidden();

  const { action } = await req.json(); // 'approve' | 'reject'
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'." }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  await supabase.from('session_change_requests').update({ status: newStatus }).eq('id', cr.id);

  if (action === 'approve') {
    await supabase
      .from('training_sessions')
      .update({ scheduled_at: cr.proposed_at })
      .eq('id', cr.session_id);
  }

  return NextResponse.json({ success: true });
}
