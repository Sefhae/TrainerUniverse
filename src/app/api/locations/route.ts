import { NextResponse } from 'next/server';
import db from '../../../lib/db';

// DB-backed and must not be evaluated at build time (no live DB during build).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db
      .prepare("SELECT location FROM trainer_profiles WHERE is_published = 1 AND location != ''")
      .all() as { location: string }[];

    const cities = new Set<string>();
    const states = new Set<string>();

    for (const { location } of rows) {
      const parts = location.split(',').map((s) => s.trim());
      if (parts[0]) cities.add(parts[0]);
      if (parts[1]) states.add(parts[1]);
    }

    return NextResponse.json({
      cities: [...cities].sort(),
      states: [...states].sort(),
    });
  } catch (err) {
    console.error('[locations]', err);
    return NextResponse.json({ cities: [], states: [] });
  }
}
