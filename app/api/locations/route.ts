import { NextResponse } from 'next/server';
import db from '../../../src/lib/db';

export function GET() {
  try {
    const rows = db
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
