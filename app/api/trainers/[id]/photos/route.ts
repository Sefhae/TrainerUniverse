import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../../../src/lib/auth';
import { serializeTrainerDetail } from '../../../../../src/lib/serialize';
import { saveUploadedFile } from '../../../../../src/lib/upload';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const formData = await req.formData();
  let changed = false;

  const profilePhoto = formData.get('profilePhoto') as File | null;
  if (profilePhoto instanceof File) {
    const path = await saveUploadedFile(profilePhoto);
    db.prepare('UPDATE trainer_profiles SET profile_photo = ? WHERE id = ?').run(path, Number(id));
    changed = true;
  }

  const coverPhoto = formData.get('coverPhoto') as File | null;
  if (coverPhoto instanceof File) {
    const path = await saveUploadedFile(coverPhoto);
    db.prepare('UPDATE trainer_profiles SET cover_photo = ? WHERE id = ?').run(path, Number(id));
    changed = true;
  }

  if (!changed) return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });

  const updated = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(id)) as Record<string, unknown>;
  return NextResponse.json(serializeTrainerDetail(updated));
}
