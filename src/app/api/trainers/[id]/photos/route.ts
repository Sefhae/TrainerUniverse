import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { serializeTrainerDetail } from '@/lib/serialize';
import { saveUploadedFile } from '@/lib/upload';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();
    const ctx = await getAuthContext(supabase);
    if (!ctx) return unauthorized();
    if (ctx.trainerId !== Number(id)) return forbidden();

    const formData = await req.formData();
    let changed = false;

    const profilePhoto = formData.get('profilePhoto') as File | null;
    if (profilePhoto instanceof File) {
      const path = await saveUploadedFile(profilePhoto);
      await supabase.from('trainer_profiles').update({ profile_photo: path }).eq('id', Number(id));
      changed = true;
    }

    const coverPhoto = formData.get('coverPhoto') as File | null;
    if (coverPhoto instanceof File) {
      const path = await saveUploadedFile(coverPhoto);
      await supabase.from('trainer_profiles').update({ cover_photo: path }).eq('id', Number(id));
      changed = true;
    }

    if (!changed) return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });

    const { data: updated } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();
    return NextResponse.json(await serializeTrainerDetail(supabase, updated as Record<string, unknown>));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
