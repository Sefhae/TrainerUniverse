import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../../../../src/lib/auth';
import { mapWork } from '../../../../../../src/lib/serialize';
import { saveUploadedFile, deleteUploadedFile } from '../../../../../../src/lib/upload';

type Params = { params: Promise<{ id: string; workId: string }> };

function parseBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
  const { id, workId } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const existing = db
    .prepare('SELECT * FROM previous_work WHERE id = ? AND trainer_id = ?')
    .get(Number(workId), Number(id)) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: 'Work entry not found.' }, { status: 404 });

  const contentType = req.headers.get('content-type') || '';
  let studentName: string | undefined,
    goal: string | undefined,
    duration: string | undefined,
    description: string | undefined,
    isVisible: boolean | undefined,
    displayOrder: number | undefined;
  let photoPath = existing.photo as string;

  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    if (fd.has('studentName')) studentName = String(fd.get('studentName'));
    if (fd.has('goal')) goal = String(fd.get('goal'));
    if (fd.has('duration')) duration = String(fd.get('duration'));
    if (fd.has('description')) description = String(fd.get('description'));
    if (fd.has('isVisible')) isVisible = parseBool(fd.get('isVisible'));
    if (fd.has('displayOrder')) displayOrder = Number(fd.get('displayOrder')) || 0;
    const photo = fd.get('photo') as File | null;
    if (photo instanceof File) photoPath = await saveUploadedFile(photo);
  } else {
    const body = await req.json().catch(() => ({}));
    if ('studentName' in body) studentName = String(body.studentName);
    if ('goal' in body) goal = String(body.goal);
    if ('duration' in body) duration = String(body.duration);
    if ('description' in body) description = String(body.description);
    if ('isVisible' in body) isVisible = parseBool(body.isVisible);
    if ('displayOrder' in body) displayOrder = Number(body.displayOrder) || 0;
    if ('photo' in body) photoPath = String(body.photo);
  }

  db.prepare(`
    UPDATE previous_work SET
      photo = ?, student_name = ?, goal = ?, duration = ?, description = ?, display_order = ?, is_visible = ?
    WHERE id = ?
  `).run(
    photoPath,
    studentName !== undefined ? studentName : existing.student_name,
    goal !== undefined ? goal : existing.goal,
    duration !== undefined ? duration : existing.duration,
    description !== undefined ? description : existing.description,
    displayOrder !== undefined ? displayOrder : existing.display_order,
    isVisible !== undefined ? (isVisible ? 1 : 0) : existing.is_visible,
    Number(workId)
  );
  const updated = db.prepare('SELECT * FROM previous_work WHERE id = ?').get(Number(workId)) as Record<string, unknown>;
  return NextResponse.json(mapWork(updated));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not update work entry.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, workId } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const existing = db
    .prepare('SELECT * FROM previous_work WHERE id = ? AND trainer_id = ?')
    .get(Number(workId), Number(id)) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: 'Work entry not found.' }, { status: 404 });

  db.prepare('DELETE FROM previous_work WHERE id = ?').run(Number(workId));

  if (existing.photo && String(existing.photo).startsWith('/uploads/')) {
    deleteUploadedFile(String(existing.photo));
  }
  return NextResponse.json({ success: true });
}
