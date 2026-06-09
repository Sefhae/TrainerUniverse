import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { serializeTrainerSummary } from '../../../lib/serialize';

function experienceBucket(years: number) {
  if (years <= 3) return '1-3';
  if (years <= 7) return '3-7';
  return '7+';
}

function csv(value: string | null): string[] {
  return String(value || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const rows = await db.prepare('SELECT * FROM trainer_profiles WHERE is_published = 1').all() as Record<string, unknown>[];
  let trainers = await Promise.all(rows.map(serializeTrainerSummary));

  const specialty = searchParams.get('specialty');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const mode = searchParams.get('mode');
  const minRating = searchParams.get('minRating');
  const availability = searchParams.get('availability');
  const experience = searchParams.get('experience');
  const sort = searchParams.get('sort');
  const city = searchParams.get('city');
  const state = searchParams.get('state');

  const wantedSpecialties = csv(specialty);
  if (wantedSpecialties.length) {
    trainers = trainers.filter((t) =>
      t.specialties.some((s: { name: string }) => wantedSpecialties.includes(s.name.toLowerCase()))
    );
  }

  if (minPrice) trainers = trainers.filter((t) => t.startingPrice >= Number(minPrice));
  if (maxPrice) trainers = trainers.filter((t) => t.startingPrice <= Number(maxPrice));

  if (mode === 'remote') trainers = trainers.filter((t) => t.isRemote);
  if (mode === 'in-person') trainers = trainers.filter((t) => !t.isRemote || Boolean(t.location));

  if (minRating) trainers = trainers.filter((t) => t.rating >= Number(minRating));

  const wantedAvailability = csv(availability);
  if (wantedAvailability.length) {
    trainers = trainers.filter((t) =>
      wantedAvailability.some((a) => (t.availability as string[]).includes(a))
    );
  }

  const wantedExperience = csv(experience);
  if (wantedExperience.length) {
    trainers = trainers.filter((t) =>
      wantedExperience.includes(experienceBucket(t.yearsExperience as number))
    );
  }

  if (city) {
    const lc = city.toLowerCase();
    trainers = trainers.filter((t) => {
      const loc = String(t.location || '');
      const parts = loc.split(',');
      return parts[0]?.trim().toLowerCase() === lc;
    });
  }

  if (state) {
    const lc = state.toLowerCase();
    trainers = trainers.filter((t) => {
      const loc = String(t.location || '');
      const parts = loc.split(',');
      return parts[1]?.trim().toLowerCase() === lc;
    });
  }

  switch (sort) {
    case 'price-asc':
      trainers.sort((a, b) => (a.startingPrice as number) - (b.startingPrice as number));
      break;
    case 'price-desc':
      trainers.sort((a, b) => (b.startingPrice as number) - (a.startingPrice as number));
      break;
    case 'most-reviewed':
      trainers.sort((a, b) => (b.reviewCount as number) - (a.reviewCount as number));
      break;
    case 'newest':
      trainers.sort(
        (a, b) =>
          new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime() ||
          (b.id as number) - (a.id as number)
      );
      break;
    case 'top-rated':
    default:
      trainers.sort(
        (a, b) =>
          (b.rating as number) - (a.rating as number) ||
          (b.reviewCount as number) - (a.reviewCount as number)
      );
      break;
  }

  return NextResponse.json({ trainers, total: trainers.length });
  } catch (err) {
    console.error('[trainers]', err);
    return NextResponse.json({ error: 'Could not load trainers.' }, { status: 500 });
  }
}
