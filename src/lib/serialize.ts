import type { ServerSupabase } from '@/lib/supabase-server';

type Row = Record<string, unknown>;

// --- row mappers (snake_case DB -> camelCase API) ---

export function mapPackage(r: Row) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    name: r.name,
    description: r.description,
    sessions: r.sessions,
    price: r.price,
    isPopular: !!r.is_popular,
  };
}

export function mapWork(r: Row) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    photo: r.photo,
    studentName: r.student_name,
    goal: r.goal,
    duration: r.duration,
    description: r.description,
    displayOrder: r.display_order,
    isVisible: !!r.is_visible,
  };
}

export function mapReview(r: Row) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

export function mapCert(r: Row) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    name: r.name,
    issuer: r.issuer,
    year: r.year,
  };
}

// --- related-record lookups (Supabase query builder) ---

type SpecialtyRef = { id: number; name: string };

const getSpecialties = async (sb: ServerSupabase, trainerId: number): Promise<SpecialtyRef[]> => {
  const { data } = await sb
    .from('trainer_specialties')
    .select('specialties(id, name)')
    .eq('trainer_id', trainerId);
  // PostgREST nests the joined specialty under `specialties` (object for a
  // to-one embed, but typed loosely without generated DB types).
  const rows = (data ?? []) as unknown as Array<{ specialties: SpecialtyRef | SpecialtyRef[] | null }>;
  const specialties = rows.flatMap((r) => {
    const s = r.specialties;
    if (!s) return [];
    return Array.isArray(s) ? s : [s];
  });
  specialties.sort((a, b) => a.name.localeCompare(b.name));
  return specialties;
};

const getPackages = async (sb: ServerSupabase, trainerId: number) => {
  const { data } = await sb
    .from('pricing_packages')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('price', { ascending: true });
  return (data ?? []).map(mapPackage);
};

const getWork = async (sb: ServerSupabase, trainerId: number) => {
  const { data } = await sb
    .from('previous_work')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });
  return (data ?? []).map(mapWork);
};

const getReviews = async (sb: ServerSupabase, trainerId: number) => {
  const { data } = await sb
    .from('reviews')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(mapReview);
};

const getCertifications = async (sb: ServerSupabase, trainerId: number) => {
  const { data } = await sb
    .from('certifications')
    .select('*')
    .eq('trainer_id', trainerId)
    .order('year', { ascending: false });
  return (data ?? []).map(mapCert);
};

async function ratingStats(sb: ServerSupabase, trainerId: number) {
  // PostgREST has no simple AVG over a filter, so pull the ratings and reduce
  // in JS — review volumes here are small enough that this is fine.
  const { data } = await sb.from('reviews').select('rating').eq('trainer_id', trainerId);
  const ratings = (data ?? []).map((r) => Number((r as { rating: number }).rating));
  const cnt = ratings.length;
  const avg = cnt ? ratings.reduce((a, b) => a + b, 0) / cnt : 0;
  return { reviewCount: cnt, rating: cnt ? Math.round(avg * 10) / 10 : 0 };
}

function startingPrice(packages: ReturnType<typeof mapPackage>[]) {
  const perSession = packages
    .map((p) => ((p.sessions as number) > 0 ? (p.price as number) / (p.sessions as number) : (p.price as number)))
    .filter((n) => Number.isFinite(n) && n > 0);
  return perSession.length ? Math.round(Math.min(...perSession)) : 0;
}

function parseAvailability(raw: unknown) {
  try {
    const parsed = JSON.parse(String(raw || '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapProfileBase(r: Row) {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    tagline: r.tagline,
    profilePhoto: r.profile_photo,
    coverPhoto: r.cover_photo,
    location: r.location,
    isRemote: !!r.is_remote,
    yearsExperience: r.years_experience,
    availability: parseAvailability(r.availability),
    isPublished: !!r.is_published,
    isVerified: !!r.is_verified,
    responseTime: (r.response_time as string) || 'within 24 hours',
    createdAt: r.created_at,
  };
}

export async function serializeTrainerSummary(sb: ServerSupabase, r: Row) {
  const id = r.id as number;
  const [packages, stats, specialties] = await Promise.all([
    getPackages(sb, id),
    ratingStats(sb, id),
    getSpecialties(sb, id),
  ]);
  return {
    ...mapProfileBase(r),
    specialties,
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    startingPrice: startingPrice(packages),
    packageCount: packages.length,
  };
}

export async function serializeTrainerDetail(sb: ServerSupabase, r: Row) {
  const id = r.id as number;
  const [summary, packages, previousWork, reviews, certifications] = await Promise.all([
    serializeTrainerSummary(sb, r),
    getPackages(sb, id),
    getWork(sb, id),
    getReviews(sb, id),
    getCertifications(sb, id),
  ]);
  return {
    ...summary,
    bio: r.bio,
    packages,
    previousWork,
    reviews,
    certifications,
  };
}
