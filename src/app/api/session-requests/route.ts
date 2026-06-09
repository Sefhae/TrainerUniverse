import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

// POST /api/session-requests — student submits a booking request
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const ctx = await getAuthContext(supabase);
    if (!ctx) return unauthorized();
    if (ctx.role !== 'student' || !ctx.studentId) return forbidden();

    const { trainerId, packageId, message } = await req.json();
    if (!trainerId) {
      return NextResponse.json({ error: 'trainerId is required.' }, { status: 400 });
    }

    const { data: trainerExists } = await supabase
      .from('trainer_profiles')
      .select('id')
      .eq('id', trainerId)
      .maybeSingle();
    if (!trainerExists) {
      return NextResponse.json({ error: 'That trainer is no longer available.' }, { status: 404 });
    }
    const { data: meExists } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', ctx.studentId)
      .maybeSingle();
    if (!meExists) {
      return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 });
    }

    const { data: existing } = await supabase
      .from('session_requests')
      .select('id')
      .eq('trainer_id', trainerId)
      .eq('student_id', ctx.studentId)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'You already have a pending request with this trainer.' }, { status: 409 });
    }

    const { data: created, error } = await supabase
      .from('session_requests')
      .insert({
        trainer_id: trainerId,
        student_id: ctx.studentId,
        package_id: packageId ?? null,
        message: message?.trim() ?? '',
      })
      .select('id')
      .single();
    if (error || !created) throw error ?? new Error('insert failed');
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    console.error('[session-requests POST]', err);
    return NextResponse.json({ error: 'Could not send your request. Please try again.' }, { status: 500 });
  }
}

// GET /api/session-requests — trainer sees incoming requests; a student sees
// the requests they've sent (with the trainer + status).
export async function GET() {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();

  if (ctx.role === 'student' && ctx.studentId) {
    const { data } = await supabase
      .from('session_requests')
      .select('id, trainer_id, package_id, message, status, created_at, trainer_profiles(name, profile_photo), pricing_packages(name)')
      .eq('student_id', ctx.studentId)
      .order('created_at', { ascending: false });

    return NextResponse.json(
      (data ?? []).map((r) => {
        const tp = one(r.trainer_profiles as { name?: string; profile_photo?: string } | { name?: string; profile_photo?: string }[] | null);
        const pp = one(r.pricing_packages as { name?: string } | { name?: string }[] | null);
        return {
          id: r.id,
          trainerId: r.trainer_id,
          trainerName: tp?.name,
          trainerPhoto: tp?.profile_photo,
          packageId: r.package_id,
          packageName: pp?.name ?? null,
          message: r.message,
          status: r.status,
          createdAt: r.created_at,
        };
      })
    );
  }

  if (ctx.role !== 'trainer' || !ctx.trainerId) return forbidden();

  const { data } = await supabase
    .from('session_requests')
    .select('id, trainer_id, student_id, package_id, message, status, created_at, student_profiles(name, users(email)), pricing_packages(name)')
    .eq('trainer_id', ctx.trainerId)
    .order('created_at', { ascending: false });

  return NextResponse.json(
    (data ?? []).map((r) => {
      const sp = one(r.student_profiles as { name?: string; users?: { email?: string } | { email?: string }[] } | { name?: string; users?: { email?: string } | { email?: string }[] }[] | null);
      const u = one(sp?.users);
      const pp = one(r.pricing_packages as { name?: string } | { name?: string }[] | null);
      return {
        id: r.id,
        trainerId: r.trainer_id,
        studentId: r.student_id,
        studentName: sp?.name,
        studentEmail: u?.email,
        packageId: r.package_id,
        packageName: pp?.name ?? null,
        message: r.message,
        status: r.status,
        createdAt: r.created_at,
      };
    })
  );
}
