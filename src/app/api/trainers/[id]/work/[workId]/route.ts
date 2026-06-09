import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { mapWork } from '@/lib/serialize';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload';

type Params = { params: Promise<{ id: string; workId: string }> };

function parseBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id, workId } = await params;
    const supabase = await getServerSupabase();
    const ctx = await getAuthContext(supabase);
    if (!ctx) return unauthorized();
    if (ctx.trainerId !== Number(id)) return forbidden();

    const { data: existing } = await supabase
      .from('previous_work')
      .select('*')
      .eq('id', Number(workId))
      .eq('trainer_id', Number(id))
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: 'Work entry not found.' }, { status: 404 });

    const contentType = req.headers.get('content-type') || '';
    const update: Record<string, unknown> = {};

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      if (fd.has('studentName')) update.student_name = String(fd.get('studentName'));
      if (fd.has('goal')) update.goal = String(fd.get('goal'));
      if (fd.has('duration')) update.duration = String(fd.get('duration'));
      if (fd.has('description')) update.description = String(fd.get('description'));
      if (fd.has('isVisible')) update.is_visible = parseBool(fd.get('isVisible')) ? 1 : 0;
      if (fd.has('displayOrder')) update.display_order = Number(fd.get('displayOrder')) || 0;
      const photo = fd.get('photo') as File | null;
      if (photo instanceof File) update.photo = await saveUploadedFile(photo);
    } else {
      const body = await req.json().catch(() => ({}));
      if ('studentName' in body) update.student_name = String(body.studentName);
      if ('goal' in body) update.goal = String(body.goal);
      if ('duration' in body) update.duration = String(body.duration);
      if ('description' in body) update.description = String(body.description);
      if ('isVisible' in body) update.is_visible = parseBool(body.isVisible) ? 1 : 0;
      if ('displayOrder' in body) update.display_order = Number(body.displayOrder) || 0;
      if ('photo' in body) update.photo = String(body.photo);
    }

    const { data: updated, error } = await supabase
      .from('previous_work')
      .update(update)
      .eq('id', Number(workId))
      .select('*')
      .single();
    if (error || !updated) return NextResponse.json({ error: 'Could not update work entry.' }, { status: 500 });
    return NextResponse.json(mapWork(updated));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not update work entry.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, workId } = await params;
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.trainerId !== Number(id)) return forbidden();

  const { data: existing } = await supabase
    .from('previous_work')
    .select('photo')
    .eq('id', Number(workId))
    .eq('trainer_id', Number(id))
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: 'Work entry not found.' }, { status: 404 });

  await supabase.from('previous_work').delete().eq('id', Number(workId));

  if (existing.photo && String(existing.photo).startsWith('/uploads/')) {
    deleteUploadedFile(String(existing.photo));
  }
  return NextResponse.json({ success: true });
}
