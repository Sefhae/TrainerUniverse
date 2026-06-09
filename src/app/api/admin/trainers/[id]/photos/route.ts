import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const formData = await req.formData();
  const result: { profilePhoto?: string; coverPhoto?: string } = {};

  const profilePhoto = formData.get('profilePhoto') as File | null;
  if (profilePhoto instanceof File) {
    const photoPath = await saveUploadedFile(profilePhoto);
    await db.prepare('UPDATE trainer_profiles SET profile_photo = ? WHERE id = ?').run(photoPath, Number(id));
    result.profilePhoto = photoPath;
  }

  const coverPhoto = formData.get('coverPhoto') as File | null;
  if (coverPhoto instanceof File) {
    const photoPath = await saveUploadedFile(coverPhoto);
    await db.prepare('UPDATE trainer_profiles SET cover_photo = ? WHERE id = ?').run(photoPath, Number(id));
    result.coverPhoto = photoPath;
  }

  if (!result.profilePhoto && !result.coverPhoto) {
    return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
  }

  return NextResponse.json(result);
}
