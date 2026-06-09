import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

type Params = { params: Promise<{ id: string }> };

// PUT /api/sessions/[id] — update a session (trainer only)
export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();

  const { id } = await params;
  const { data: session } = await supabase
    .from('training_sessions')
    .select('trainer_id')
    .eq('id', Number(id))
    .maybeSingle();
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  if (session.trainer_id !== ctx.trainerId) return forbidden();

  const { title, scheduledAt, durationMin, notes, status } = await req.json();
  const update: Record<string, unknown> = {};
  if (title != null) update.title = title;
  if (scheduledAt != null) update.scheduled_at = scheduledAt;
  if (durationMin != null) update.duration_min = durationMin;
  if (notes != null) update.notes = notes;
  if (status != null) update.status = status;
  if (Object.keys(update).length) {
    await supabase.from('training_sessions').update(update).eq('id', Number(id));
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/sessions/[id] — delete a session (trainer only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();

  const { id } = await params;
  const { data: session } = await supabase
    .from('training_sessions')
    .select('trainer_id')
    .eq('id', Number(id))
    .maybeSingle();
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  if (session.trainer_id !== ctx.trainerId) return forbidden();

  await supabase.from('training_sessions').delete().eq('id', Number(id));
  return NextResponse.json({ success: true });
}
