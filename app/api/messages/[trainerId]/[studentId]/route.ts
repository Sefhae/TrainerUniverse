import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../../../src/lib/auth';

type Params = { params: Promise<{ trainerId: string; studentId: string }> };

// GET /api/messages/[trainerId]/[studentId] — fetch messages in a thread
export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  const { trainerId, studentId } = await params;
  const tId = Number(trainerId);
  const sId = Number(studentId);

  const isTrainer = payload.role === 'trainer' && payload.trainerId === tId;
  const isStudent = payload.role === 'student' && payload.studentId === sId;
  if (!isTrainer && !isStudent) return forbidden();

  const rows = db.prepare(`
    SELECT * FROM messages
    WHERE trainer_id = ? AND student_id = ?
    ORDER BY created_at ASC
  `).all(tId, sId) as Array<{
    id: number;
    trainer_id: number;
    student_id: number;
    sender: string;
    content: string;
    created_at: string;
  }>;

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      trainerId: r.trainer_id,
      studentId: r.student_id,
      sender: r.sender,
      content: r.content,
      createdAt: r.created_at,
    }))
  );
}

// POST /api/messages/[trainerId]/[studentId] — send a message
export async function POST(req: NextRequest, { params }: Params) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  const { trainerId, studentId } = await params;
  const tId = Number(trainerId);
  const sId = Number(studentId);

  const isTrainer = payload.role === 'trainer' && payload.trainerId === tId;
  const isStudent = payload.role === 'student' && payload.studentId === sId;
  if (!isTrainer && !isStudent) return forbidden();

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });

  const result = db.prepare(`
    INSERT INTO messages (trainer_id, student_id, sender, content)
    VALUES (?, ?, ?, ?)
  `).run(tId, sId, payload.role, content.trim());

  return NextResponse.json({ id: result.lastInsertRowid });
}
