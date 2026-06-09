import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../../src/lib/auth';
import { saveUploadedFile } from '../../../../src/lib/upload';

// GET /api/student/profile — the logged-in student's name, email, photo
export async function GET(req: NextRequest) {
  const p = verifyToken(req);
  if (!p) return unauthorized();
  if (p.role !== 'student' || !p.studentId) return forbidden();

  const row = db.prepare(`
    SELECT sp.name, sp.profile_photo, u.email
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE sp.id = ?
  `).get(p.studentId) as { name: string; profile_photo: string; email: string } | undefined;

  if (!row) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  return NextResponse.json({ name: row.name, email: row.email, profilePhoto: row.profile_photo });
}

// POST /api/student/profile — upload the logged-in student's profile photo
export async function POST(req: NextRequest) {
  try {
    const p = verifyToken(req);
    if (!p) return unauthorized();
    if (p.role !== 'student' || !p.studentId) return forbidden();

    const formData = await req.formData();
    const profilePhoto = formData.get('profilePhoto') as File | null;
    if (!(profilePhoto instanceof File)) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    const path = await saveUploadedFile(profilePhoto);
    db.prepare('UPDATE student_profiles SET profile_photo = ? WHERE id = ?').run(path, p.studentId);

    return NextResponse.json({ profilePhoto: path });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
