import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { mapReview } from '@/lib/serialize';
import { checkProfanity } from '@/lib/profanity';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('trainer_id', Number(id))
    .order('created_at', { ascending: false });
  return NextResponse.json((data ?? []).map(mapReview));
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data: trainer } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('id', Number(id))
    .maybeSingle();
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
  const profanity = checkProfanity(reviewerName, comment);
  if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

  const { data: created, error } = await supabase
    .from('reviews')
    .insert({
      trainer_id: Number(id),
      reviewer_name: String(reviewerName).trim(),
      rating: Math.round(numericRating),
      comment: String(comment).trim(),
    })
    .select('*')
    .single();
  if (error || !created) return NextResponse.json({ error: 'Could not submit review.' }, { status: 500 });
  return NextResponse.json(mapReview(created), { status: 201 });
}
