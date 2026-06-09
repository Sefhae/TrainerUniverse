import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

// GET /api/trainer/students — list all students enrolled with the auth'd trainer
export async function GET() {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();
  const trainerId = ctx.trainerId;

  // 1) Enrolled students (+ name + email via nested embed).
  const { data: enrolments } = await supabase
    .from('trainer_students')
    .select('student_id, enrolled_at, student_profiles(id, name, users(email))')
    .eq('trainer_id', trainerId)
    .order('enrolled_at', { ascending: false });

  // 2) Session counts per student, computed in JS to avoid a GROUP BY.
  const { data: sessions } = await supabase
    .from('training_sessions')
    .select('student_id')
    .eq('trainer_id', trainerId);
  const sessionCount = new Map<number, number>();
  for (const s of sessions ?? []) {
    sessionCount.set(s.student_id, (sessionCount.get(s.student_id) ?? 0) + 1);
  }

  // 3) Which students have a pending removal request.
  const { data: removals } = await supabase
    .from('student_removal_requests')
    .select('student_id')
    .eq('trainer_id', trainerId)
    .eq('status', 'pending');
  const removalPending = new Set((removals ?? []).map((r) => r.student_id));

  return NextResponse.json(
    (enrolments ?? []).map((r) => {
      const sp = one(
        r.student_profiles as
          | { id: number; name: string; users?: { email?: string } | { email?: string }[] }
          | { id: number; name: string; users?: { email?: string } | { email?: string }[] }[]
          | null
      );
      const u = one(sp?.users);
      return {
        id: sp?.id ?? r.student_id,
        name: sp?.name,
        email: u?.email,
        enrolledAt: r.enrolled_at,
        sessionCount: sessionCount.get(r.student_id) ?? 0,
        removalPending: removalPending.has(r.student_id),
      };
    })
  );
}

// POST /api/trainer/students — enroll a student by email
export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('role', 'student')
    .maybeSingle();
  if (!user) return NextResponse.json({ error: 'No student found with that email.' }, { status: 404 });

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });

  const { data: existing } = await supabase
    .from('trainer_students')
    .select('student_id')
    .eq('trainer_id', ctx.trainerId)
    .eq('student_id', profile.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: 'Student is already enrolled.' }, { status: 409 });

  await supabase.from('trainer_students').insert({ trainer_id: ctx.trainerId, student_id: profile.id });
  return NextResponse.json({ success: true, studentId: profile.id });
}

// Direct removal is no longer allowed — trainers must request removal and a
// TrainerUniverse admin approves it (see app/api/trainer/students/removal).
