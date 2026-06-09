import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

// PUT /api/session-requests/[id] — trainer approves or rejects
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();

  const { id } = await params;
  const requestId = Number(id);

  const { data: row } = await supabase
    .from('session_requests')
    .select('*')
    .eq('id', requestId)
    .eq('trainer_id', ctx.trainerId)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  if (row.status !== 'pending') {
    return NextResponse.json({ error: 'Request has already been resolved.' }, { status: 409 });
  }

  const { action } = (await req.json()) as { action: 'approve' | 'reject' };
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject".' }, { status: 400 });
  }

  if (action === 'approve') {
    await supabase.from('session_requests').update({ status: 'approved' }).eq('id', requestId);
    // Enroll the student if not already enrolled (composite PK guards duplicates).
    await supabase
      .from('trainer_students')
      .upsert(
        { trainer_id: ctx.trainerId, student_id: row.student_id },
        { onConflict: 'trainer_id,student_id', ignoreDuplicates: true }
      );
  } else {
    await supabase.from('session_requests').update({ status: 'rejected' }).eq('id', requestId);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/session-requests/[id] — student withdraws their own pending request.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'student' || !ctx.studentId) return forbidden();

  const { id } = await params;
  const requestId = Number(id);

  const { data: row } = await supabase
    .from('session_requests')
    .select('status')
    .eq('id', requestId)
    .eq('student_id', ctx.studentId)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  if (row.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending requests can be cancelled.' }, { status: 409 });
  }

  await supabase.from('session_requests').delete().eq('id', requestId);
  return NextResponse.json({ ok: true });
}
