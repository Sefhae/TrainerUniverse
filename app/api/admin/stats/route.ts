import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../src/lib/auth';

export async function GET(req: NextRequest) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const trainers  = (db.prepare('SELECT COUNT(*) AS c FROM trainer_profiles').get() as { c: number }).c;
  const published = (db.prepare('SELECT COUNT(*) AS c FROM trainer_profiles WHERE is_published = 1').get() as { c: number }).c;
  const students  = (db.prepare('SELECT COUNT(*) AS c FROM student_profiles').get() as { c: number }).c;
  const sessions  = (db.prepare('SELECT COUNT(*) AS c FROM training_sessions').get() as { c: number }).c;
  const messages  = (db.prepare('SELECT COUNT(*) AS c FROM messages').get() as { c: number }).c;

  return NextResponse.json({ trainers, published, students, sessions, messages });
}
