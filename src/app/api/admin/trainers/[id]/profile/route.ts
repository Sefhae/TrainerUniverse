import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { name, tagline, bio, location, yearsExperience, isRemote } = await req.json();

  await db.prepare(`
    UPDATE trainer_profiles
    SET name = ?, tagline = ?, bio = ?, location = ?, years_experience = ?, is_remote = ?
    WHERE id = ?
  `).run(name, tagline ?? '', bio ?? '', location ?? '', Number(yearsExperience) || 0, isRemote ? 1 : 0, Number(id));

  return NextResponse.json({ ok: true });
}
