import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { saveUploadedFile } from '@/lib/upload';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const formData = await req.formData();
  const result: { profilePhoto?: string; coverPhoto?: string } = {};

  const profilePhoto = formData.get('profilePhoto') as File | null;
  if (profilePhoto instanceof File) {
    const photoPath = await saveUploadedFile(profilePhoto);
    await admin.from('trainer_profiles').update({ profile_photo: photoPath }).eq('id', Number(id));
    result.profilePhoto = photoPath;
  }

  const coverPhoto = formData.get('coverPhoto') as File | null;
  if (coverPhoto instanceof File) {
    const photoPath = await saveUploadedFile(coverPhoto);
    await admin.from('trainer_profiles').update({ cover_photo: photoPath }).eq('id', Number(id));
    result.coverPhoto = photoPath;
  }

  if (!result.profilePhoto && !result.coverPhoto) {
    return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
  }

  return NextResponse.json(result);
}
