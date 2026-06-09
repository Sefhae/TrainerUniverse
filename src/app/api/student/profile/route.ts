import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { saveUploadedFile } from '@/lib/upload';

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

// GET /api/student/profile — the logged-in student's name, email, photo
export async function GET() {
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.role !== 'student' || !ctx.studentId) return forbidden();

  const { data: row } = await supabase
    .from('student_profiles')
    .select('name, profile_photo, users(email)')
    .eq('id', ctx.studentId)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  const u = one(row.users as { email?: string } | { email?: string }[] | null);
  return NextResponse.json({ name: row.name, email: u?.email, profilePhoto: row.profile_photo });
}

// POST /api/student/profile — upload the logged-in student's profile photo
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const ctx = await getAuthContext(supabase);
    if (!ctx) return unauthorized();
    if (ctx.role !== 'student' || !ctx.studentId) return forbidden();

    const formData = await req.formData();
    const profilePhoto = formData.get('profilePhoto') as File | null;
    if (!(profilePhoto instanceof File)) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    const path = await saveUploadedFile(profilePhoto);
    await supabase.from('student_profiles').update({ profile_photo: path }).eq('id', ctx.studentId);

    return NextResponse.json({ profilePhoto: path });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
