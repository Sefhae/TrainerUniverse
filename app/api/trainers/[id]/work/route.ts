import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../../../src/lib/auth';
import { mapWork } from '../../../../../src/lib/serialize';
import { saveUploadedFile } from '../../../../../src/lib/upload';

type Params = { params: Promise<{ id: string }> };

function parseBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = (db
    .prepare('SELECT * FROM previous_work WHERE trainer_id = ? ORDER BY display_order ASC, id ASC')
    .all(Number(id)) as Record<string, unknown>[]).map(mapWork);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const contentType = req.headers.get('content-type') || '';
  let studentName = '', goal = '', duration = '', description = '', isVisible = true;
  let photoPath = '';

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    studentName = String(fd.get('studentName') || '');
    goal = String(fd.get('goal') || '');
    duration = String(fd.get('duration') || '');
    description = String(fd.get('description') || '');
    isVisible = parseBool(fd.get('isVisible'), true);
    const photo = fd.get('photo') as File | null;
    if (photo instanceof File) photoPath = await saveUploadedFile(photo);
  } else {
    const body = await req.json().catch(() => ({}));
    studentName = String(body.studentName || '');
    goal = String(body.goal || '');
    duration = String(body.duration || '');
    description = String(body.description || '');
    isVisible = parseBool(body.isVisible, true);
    if (body.photo) photoPath = String(body.photo);
  }

  const orderRow = db.prepare('SELECT COUNT(*) AS c FROM previous_work WHERE trainer_id = ?').get(Number(id)) as { c: number };
  const order = orderRow.c;

  const info = db
    .prepare(`
      INSERT INTO previous_work
        (trainer_id, photo, student_name, goal, duration, description, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(Number(id), photoPath, studentName, goal, duration, description, order, isVisible ? 1 : 0);
  const created = db.prepare('SELECT * FROM previous_work WHERE id = ?').get(info.lastInsertRowid) as Record<string, unknown>;
  return NextResponse.json(mapWork(created), { status: 201 });
}
