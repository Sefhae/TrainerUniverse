import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { mapWork } from '@/lib/serialize';
import { saveUploadedFile } from '@/lib/upload';

type Params = { params: Promise<{ id: string }> };

function parseBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('previous_work')
    .select('*')
    .eq('trainer_id', Number(id))
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });
  return NextResponse.json((data ?? []).map(mapWork));
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();
    const ctx = await getAuthContext(supabase);
    if (!ctx) return unauthorized();
    if (ctx.trainerId !== Number(id)) return forbidden();

    const contentType = req.headers.get('content-type') || '';
    let studentName = '', goal = '', duration = '', description = '', isVisible = true;
    let photoPath = '';

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      studentName = String(fd.get('studentName') || '');
      goal = String(fd.get('goal') || '');
      duration = String(fd.get('duration') || '');
      description = String(fd.get('description') || '');
      isVisible = parseBool(fd.get('isVisible'), true);
      const photo = fd.get('photo') as File | null;
      if (photo instanceof File) photoPath = await saveUploadedFile(photo);
    } else {
      const body = await req.json().catch(() => ({}));
      studentName = String(body.studentName || '');
      goal = String(body.goal || '');
      duration = String(body.duration || '');
      description = String(body.description || '');
      isVisible = parseBool(body.isVisible, true);
      if (body.photo) photoPath = String(body.photo);
    }

    const { count } = await supabase
      .from('previous_work')
      .select('id', { count: 'exact', head: true })
      .eq('trainer_id', Number(id));

    const { data: created, error } = await supabase
      .from('previous_work')
      .insert({
        trainer_id: Number(id),
        photo: photoPath,
        student_name: studentName,
        goal,
        duration,
        description,
        display_order: count ?? 0,
        is_visible: isVisible ? 1 : 0,
      })
      .select('*')
      .single();
    if (error || !created) return NextResponse.json({ error: 'Could not save work entry.' }, { status: 500 });
    return NextResponse.json(mapWork(created), { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not save work entry.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
