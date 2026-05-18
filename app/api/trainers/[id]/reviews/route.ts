import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { mapReview } from '../../../../../src/lib/serialize';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = (db
    .prepare('SELECT * FROM reviews WHERE trainer_id = ? ORDER BY created_at DESC')
    .all(Number(id)) as Record<string, unknown>[]).map(mapReview);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const trainer = db.prepare('SELECT id FROM trainer_profiles WHERE id = ?').get(Number(id));
  if (!trainer) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { reviewerName, rating, comment } = body || {};
  if (!reviewerName || !String(reviewerName).trim())
    return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5)
    return NextResponse.json({ error: 'Please choose a rating between 1 and 5 stars.' }, { status: 400 });
  if (!comment || !String(comment).trim())
    return NextResponse.json({ error: 'Please write a short comment.' }, { status: 400 });

  const info = db
    .prepare('INSERT INTO reviews (trainer_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)')
    .run(Number(id), String(reviewerName).trim(), Math.round(numericRating), String(comment).trim());
  const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid) as Record<string, unknown>;
  return NextResponse.json(mapReview(created), { status: 201 });
}
