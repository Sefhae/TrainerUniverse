import { NextRequest, NextResponse } from 'next/server';
import worldCities from '@/data/world-cities.json';

// world-cities.json is [name, countryCode][] sorted by population (desc),
// so scanning in order surfaces the most relevant matches first.
const CITIES = worldCities as [string, string][];

// Pre-lowercase once at module load for fast repeated searches.
const INDEX: { name: string; cc: string; lower: string }[] = CITIES.map(([name, cc]) => ({
  name,
  cc,
  lower: name.toLowerCase(),
}));

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countryCache = new Map<string, string>();
function countryName(cc: string): string {
  const cached = countryCache.get(cc);
  if (cached) return cached;
  let name = cc;
  try {
    name = regionNames.of(cc) || cc;
  } catch {
    name = cc;
  }
  countryCache.set(cc, name);
  return name;
}

const LIMIT = 12;

export function GET(req: NextRequest) {
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ cities: [] });

  const prefix: typeof INDEX = [];
  const contains: typeof INDEX = [];

  for (let i = 0; i < INDEX.length; i++) {
    const e = INDEX[i];
    if (e.lower.startsWith(q)) {
      prefix.push(e);
      // Entries are population-sorted, so the first LIMIT prefix hits are the best.
      if (prefix.length >= LIMIT) break;
    } else if (contains.length < LIMIT && e.lower.includes(q)) {
      contains.push(e);
    }
  }

  const matches = (prefix.length >= LIMIT ? prefix : [...prefix, ...contains]).slice(0, LIMIT);
  const cities = matches.map((e) => ({ name: e.name, country: countryName(e.cc) }));

  return NextResponse.json({ cities });
}
