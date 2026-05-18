import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../../src/lib/auth';
import { serializeTrainerDetail } from '../../../../src/lib/serialize';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const row = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
  if (!row) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });
  return NextResponse.json(serializeTrainerDetail(row));
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const existing = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { name, tagline, bio, location, isRemote, yearsExperience, availability, isPublished, specialties } = body || {};

  db.prepare(`
    UPDATE trainer_profiles SET
      name = ?, tagline = ?, bio = ?, location = ?,
      is_remote = ?, years_experience = ?, availability = ?, is_published = ?
    WHERE id = ?
  `).run(
    name !== undefined ? String(name) : existing.name,
    tagline !== undefined ? String(tagline) : existing.tagline,
    bio !== undefined ? String(bio) : existing.bio,
    location !== undefined ? String(location) : existing.location,
    isRemote !== undefined ? (isRemote ? 1 : 0) : existing.is_remote,
    yearsExperience !== undefined ? Number(yearsExperience) || 0 : existing.years_experience,
    availability !== undefined ? JSON.stringify(Array.isArray(availability) ? availability : []) : existing.availability,
    isPublished !== undefined ? (isPublished ? 1 : 0) : existing.is_published,
    Number(id)
  );

  if (Array.isArray(specialties)) {
    db.prepare('DELETE FROM trainer_specialties WHERE trainer_id = ?').run(Number(id));
    const findSpec = db.prepare('SELECT id FROM specialties WHERE name = ?');
    const link = db.prepare('INSERT OR IGNORE INTO trainer_specialties (trainer_id, specialty_id) VALUES (?, ?)');
    for (const sName of specialties) {
      const row = findSpec.get(sName) as { id: number } | undefined;
      if (row) link.run(Number(id), row.id);
    }
  }

  const updated = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(id)) as Record<string, unknown>;
  return NextResponse.json(serializeTrainerDetail(updated));
}
