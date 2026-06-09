import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';
import { serializeTrainerDetail } from '@/lib/serialize';
import { checkProfanity } from '@/lib/profanity';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const row = await db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
    if (!row) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });
    return NextResponse.json(await serializeTrainerDetail(row));
  } catch (err) {
    console.error('[trainer GET]', err);
    return NextResponse.json({ error: 'Could not load trainer.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
  const { id } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const existing = await db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { name, tagline, bio, location, isRemote, yearsExperience, availability, isPublished, specialties } = body || {};

  const profanity = checkProfanity(name, tagline, bio, location);
  if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

  await db.prepare(`
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
    await db.prepare('DELETE FROM trainer_specialties WHERE trainer_id = ?').run(Number(id));
    const findSpec = db.prepare('SELECT id FROM specialties WHERE name = ?');
    const link = db.prepare('INSERT INTO trainer_specialties (trainer_id, specialty_id) VALUES (?, ?) ON CONFLICT DO NOTHING');
    for (const sName of specialties) {
      const row = (await findSpec.get(sName)) as { id: number } | undefined;
      if (row) await link.run(Number(id), row.id);
    }
  }

  const updated = await db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(id)) as Record<string, unknown>;
  return NextResponse.json(await serializeTrainerDetail(updated));
  } catch (err) {
    console.error('[trainer PUT]', err);
    return NextResponse.json({ error: 'Could not update profile.' }, { status: 500 });
  }
}
