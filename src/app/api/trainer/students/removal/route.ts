import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

// POST /api/trainer/students/removal — trainer requests removal of a student.
// The student stays enrolled until a TrainerUniverse admin approves the request.
export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();

  const { studentId, reason } = await req.json();
  if (!studentId) return NextResponse.json({ error: 'studentId required.' }, { status: 400 });

  const { data: enrolled } = await supabase
    .from('trainer_students')
    .select('student_id')
    .eq('trainer_id', ctx.trainerId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (!enrolled) return NextResponse.json({ error: 'Student is not enrolled with you.' }, { status: 404 });

  const { data: existing } = await supabase
    .from('student_removal_requests')
    .select('id')
    .eq('trainer_id', ctx.trainerId)
    .eq('student_id', studentId)
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'A removal request is already pending for this student.' }, { status: 409 });
  }

  await supabase
    .from('student_removal_requests')
    .insert({ trainer_id: ctx.trainerId, student_id: studentId, reason: (reason ?? '').toString().trim() });

  return NextResponse.json({ success: true });
}
