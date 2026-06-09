import db from './db';

// --- row mappers (snake_case DB -> camelCase API) ---

export function mapPackage(r: Record<string, unknown>) {
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

export function mapWork(r: Record<string, unknown>) {
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

export function mapReview(r: Record<string, unknown>) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

export function mapCert(r: Record<string, unknown>) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    name: r.name,
    issuer: r.issuer,
    year: r.year,
  };
}

// --- related-record lookups ---

const getSpecialties = async (trainerId: number) =>
  (await db.prepare(`
    SELECT s.id, s.name FROM specialties s
    JOIN trainer_specialties ts ON ts.specialty_id = s.id
    WHERE ts.trainer_id = ?
    ORDER BY s.name
  `).all(trainerId)) as { id: number; name: string }[];

const getPackages = async (trainerId: number) =>
  ((await db.prepare('SELECT * FROM pricing_packages WHERE trainer_id = ? ORDER BY price ASC').all(trainerId)) as Record<string, unknown>[]).map(mapPackage);

const getWork = async (trainerId: number) =>
  ((await db.prepare('SELECT * FROM previous_work WHERE trainer_id = ? ORDER BY display_order ASC, id ASC').all(trainerId)) as Record<string, unknown>[]).map(mapWork);

const getReviews = async (trainerId: number) =>
  ((await db.prepare('SELECT * FROM reviews WHERE trainer_id = ? ORDER BY created_at DESC').all(trainerId)) as Record<string, unknown>[]).map(mapReview);

const getCertifications = async (trainerId: number) =>
  ((await db.prepare('SELECT * FROM certifications WHERE trainer_id = ? ORDER BY year DESC').all(trainerId)) as Record<string, unknown>[]).map(mapCert);

async function ratingStats(trainerId: number) {
  const row = (await db.prepare('SELECT COUNT(*) AS cnt, AVG(rating) AS avg FROM reviews WHERE trainer_id = ?').get(trainerId)) as { cnt: number; avg: number | null };
  return {
    reviewCount: row.cnt,
    rating: row.cnt ? Math.round((row.avg ?? 0) * 10) / 10 : 0,
  };
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

function mapProfileBase(r: Record<string, unknown>) {
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

export async function serializeTrainerSummary(r: Record<string, unknown>) {
  const id = r.id as number;
  const [packages, stats, specialties] = await Promise.all([
    getPackages(id),
    ratingStats(id),
    getSpecialties(id),
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

export async function serializeTrainerDetail(r: Record<string, unknown>) {
  const id = r.id as number;
  const [summary, packages, previousWork, reviews, certifications] = await Promise.all([
    serializeTrainerSummary(r),
    getPackages(id),
    getWork(id),
    getReviews(id),
    getCertifications(id),
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
