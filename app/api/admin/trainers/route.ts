import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../src/lib/auth';

export async function GET(req: NextRequest) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const rows = db.prepare(`
    SELECT
      tp.id,
      tp.name,
      tp.is_published,
      tp.is_verified,
      tp.created_at,
      u.email,
      (SELECT GROUP_CONCAT(s.name, ', ')
       FROM trainer_specialties tspc
       JOIN specialties s ON s.id = tspc.specialty_id
       WHERE tspc.trainer_id = tp.id) AS specialties,
      (SELECT COUNT(*) FROM trainer_students ts WHERE ts.trainer_id = tp.id) AS student_count,
      (SELECT COUNT(*) FROM training_sessions sess WHERE sess.trainer_id = tp.id) AS session_count
    FROM trainer_profiles tp
    JOIN users u ON u.id = tp.user_id
    ORDER BY tp.created_at DESC
  `).all();

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { name, email, password } = await req.json();
  if (!name || !email || !password || String(password).length < 6) {
    return NextResponse.json({ error: 'Name, email, and password (min 6 chars) are required.' }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });

  const passwordHash = bcrypt.hashSync(String(password), 10);

  const trainerId = db.transaction(() => {
    const userId = db
      .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run(normalizedEmail, passwordHash, 'trainer').lastInsertRowid as number;
    return db
      .prepare('INSERT INTO trainer_profiles (user_id, name, is_published) VALUES (?, ?, 1)')
      .run(userId, String(name).trim()).lastInsertRowid as number;
  })();

  const trainer = db.prepare(`
    SELECT tp.id, tp.name, tp.is_published, tp.created_at, u.email,
           NULL as specialties, 0 as student_count, 0 as session_count
    FROM trainer_profiles tp
    JOIN users u ON u.id = tp.user_id
    WHERE tp.id = ?
  `).get(trainerId);

  return NextResponse.json(trainer, { status: 201 });
}
