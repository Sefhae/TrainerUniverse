import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { serializeTrainerDetail } from '@/lib/serialize';
import { checkProfanity } from '@/lib/profanity';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();
    const { data: row } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();
    if (!row) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });
    return NextResponse.json(await serializeTrainerDetail(supabase, row));
  } catch (err) {
    console.error('[trainer GET]', err);
    return NextResponse.json({ error: 'Could not load trainer.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();
    const ctx = await getAuthContext(supabase);
    if (!ctx) return unauthorized();
    if (ctx.trainerId !== Number(id)) return forbidden();

    const { data: existing } = await supabase
      .from('trainer_profiles')
      .select('id')
      .eq('id', Number(id))
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { name, tagline, bio, location, isRemote, yearsExperience, availability, isPublished, specialties } = body || {};

    const profanity = checkProfanity(name, tagline, bio, location);
    if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = String(name);
    if (tagline !== undefined) update.tagline = String(tagline);
    if (bio !== undefined) update.bio = String(bio);
    if (location !== undefined) update.location = String(location);
    if (isRemote !== undefined) update.is_remote = isRemote ? 1 : 0;
    if (yearsExperience !== undefined) update.years_experience = Number(yearsExperience) || 0;
    if (availability !== undefined)
      update.availability = JSON.stringify(Array.isArray(availability) ? availability : []);
    if (isPublished !== undefined) update.is_published = isPublished ? 1 : 0;
    if (Object.keys(update).length) {
      await supabase.from('trainer_profiles').update(update).eq('id', Number(id));
    }

    if (Array.isArray(specialties)) {
      await supabase.from('trainer_specialties').delete().eq('trainer_id', Number(id));
      const { data: specRows } = await supabase
        .from('specialties')
        .select('id, name')
        .in('name', specialties.map(String));
      const links = (specRows ?? []).map((s) => ({ trainer_id: Number(id), specialty_id: s.id }));
      if (links.length) await supabase.from('trainer_specialties').insert(links);
    }

    const { data: updated } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();
    return NextResponse.json(await serializeTrainerDetail(supabase, updated as Record<string, unknown>));
  } catch (err) {
    console.error('[trainer PUT]', err);
    return NextResponse.json({ error: 'Could not update profile.' }, { status: 500 });
  }
}
