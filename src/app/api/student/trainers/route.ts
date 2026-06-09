import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

// GET /api/student/trainers — trainers the authenticated student is enrolled
// with (i.e. trainers who approved their request).
export async function GET() {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'student' || !ctx.studentId) return forbidden();

  const { data } = await supabase
    .from('trainer_students')
    .select('enrolled_at, trainer_profiles(id, name, tagline, profile_photo)')
    .eq('student_id', ctx.studentId)
    .order('enrolled_at', { ascending: false });

  return NextResponse.json(
    (data ?? []).map((r) => {
      const tp = one(
        r.trainer_profiles as
          | { id: number; name: string; tagline: string; profile_photo: string }
          | { id: number; name: string; tagline: string; profile_photo: string }[]
          | null
      );
      return {
        id: tp?.id,
        name: tp?.name,
        tagline: tp?.tagline,
        profilePhoto: tp?.profile_photo,
        enrolledAt: r.enrolled_at,
      };
    })
  );
}
