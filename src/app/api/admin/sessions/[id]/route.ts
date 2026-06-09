import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { title, scheduledAt, durationMin, status, notes } = await req.json();

  await admin
    .from('training_sessions')
    .update({
      title,
      scheduled_at: scheduledAt,
      duration_min: Number(durationMin) || 60,
      status,
      notes: notes ?? '',
    })
    .eq('id', Number(id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { data: deleted } = await admin
    .from('training_sessions')
    .delete()
    .eq('id', Number(id))
    .select('id');
  if (!deleted || deleted.length === 0)
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
