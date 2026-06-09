import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { checkProfanity } from '@/lib/profanity';

type Params = { params: Promise<{ trainerId: string; studentId: string }> };

// GET /api/messages/[trainerId]/[studentId] — fetch messages in a thread
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();

  const { trainerId, studentId } = await params;
  const tId = Number(trainerId);
  const sId = Number(studentId);

  const isTrainer = ctx.role === 'trainer' && ctx.trainerId === tId;
  const isStudent = ctx.role === 'student' && ctx.studentId === sId;
  if (!isTrainer && !isStudent) return forbidden();

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('trainer_id', tId)
    .eq('student_id', sId)
    .order('created_at', { ascending: true });

  return NextResponse.json(
    (data ?? []).map((r) => ({
      id: r.id,
      trainerId: r.trainer_id,
      studentId: r.student_id,
      sender: r.sender,
      content: r.content,
      createdAt: r.created_at,
    }))
  );
}

// POST /api/messages/[trainerId]/[studentId] — send a message
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const supabase = await getServerSupabase();
    const ctx = await getAuthContext(supabase);
    if (!ctx) return unauthorized();

    const { trainerId, studentId } = await params;
    const tId = Number(trainerId);
    const sId = Number(studentId);

    const isTrainer = ctx.role === 'trainer' && ctx.trainerId === tId;
    const isStudent = ctx.role === 'student' && ctx.studentId === sId;
    if (!isTrainer && !isStudent) return forbidden();

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    const profanity = checkProfanity(content);
    if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

    const { data: trainerExists } = await supabase.from('trainer_profiles').select('id').eq('id', tId).maybeSingle();
    const { data: studentExists } = await supabase.from('student_profiles').select('id').eq('id', sId).maybeSingle();
    if (!trainerExists || !studentExists) {
      return NextResponse.json({ error: 'This conversation is no longer available.' }, { status: 404 });
    }

    const { data: created, error } = await supabase
      .from('messages')
      .insert({ trainer_id: tId, student_id: sId, sender: ctx.role, content: content.trim() })
      .select('id')
      .single();
    if (error || !created) throw error ?? new Error('insert failed');
    return NextResponse.json({ id: created.id });
  } catch (err) {
    console.error('[messages POST]', err);
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 });
  }
}
