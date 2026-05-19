import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../../src/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const profile = db.prepare(`
    SELECT tp.id, tp.name, tp.tagline, tp.bio, tp.location, tp.is_remote,
           tp.years_experience, tp.is_published, u.email
    FROM trainer_profiles tp
    JOIN users u ON u.id = tp.user_id
    WHERE tp.id = ?
  `).get(Number(id));
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const trainer = db.prepare('SELECT user_id FROM trainer_profiles WHERE id = ?').get(Number(id)) as { user_id: number } | undefined;
  if (!trainer) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  db.prepare('DELETE FROM users WHERE id = ?').run(trainer.user_id);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { isPublished } = await req.json();
  db.prepare('UPDATE trainer_profiles SET is_published = ? WHERE id = ?').run(isPublished ? 1 : 0, Number(id));
  return NextResponse.json({ ok: true });
}
