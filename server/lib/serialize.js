const db = require('../db/database');

// --- row mappers (snake_case DB -> camelCase API) ---

function mapPackage(r) {
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

function mapWork(r) {
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

function mapReview(r) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

function mapCert(r) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    name: r.name,
    issuer: r.issuer,
    year: r.year,
  };
}

// --- related-record lookups ---

const getSpecialties = (trainerId) =>
  db.prepare(`
    SELECT s.id, s.name FROM specialties s
    JOIN trainer_specialties ts ON ts.specialty_id = s.id
    WHERE ts.trainer_id = ?
    ORDER BY s.name
  `).all(trainerId);

const getPackages = (trainerId) =>
  db.prepare('SELECT * FROM pricing_packages WHERE trainer_id = ? ORDER BY price ASC').all(trainerId).map(mapPackage);

const getWork = (trainerId) =>
  db.prepare('SELECT * FROM previous_work WHERE trainer_id = ? ORDER BY display_order ASC, id ASC').all(trainerId).map(mapWork);

const getReviews = (trainerId) =>
  db.prepare('SELECT * FROM reviews WHERE trainer_id = ? ORDER BY created_at DESC').all(trainerId).map(mapReview);

const getCertifications = (trainerId) =>
  db.prepare('SELECT * FROM certifications WHERE trainer_id = ? ORDER BY year DESC').all(trainerId).map(mapCert);

function ratingStats(trainerId) {
  const row = db.prepare('SELECT COUNT(*) AS cnt, AVG(rating) AS avg FROM reviews WHERE trainer_id = ?').get(trainerId);
  return {
    reviewCount: row.cnt,
    rating: row.cnt ? Math.round(row.avg * 10) / 10 : 0,
  };
}

// Lowest effective per-session price across a trainer's packages.
function startingPrice(packages) {
  const perSession = packages
    .map((p) => (p.sessions > 0 ? p.price / p.sessions : p.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  return perSession.length ? Math.round(Math.min(...perSession)) : 0;
}

function parseAvailability(raw) {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapProfileBase(r) {
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
    createdAt: r.created_at,
  };
}

function serializeTrainerSummary(r) {
  const packages = getPackages(r.id);
  const stats = ratingStats(r.id);
  return {
    ...mapProfileBase(r),
    specialties: getSpecialties(r.id),
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    startingPrice: startingPrice(packages),
    packageCount: packages.length,
  };
}

function serializeTrainerDetail(r) {
  return {
    ...serializeTrainerSummary(r),
    bio: r.bio,
    packages: getPackages(r.id),
    previousWork: getWork(r.id),
    reviews: getReviews(r.id),
    certifications: getCertifications(r.id),
  };
}

module.exports = {
  mapPackage,
  mapWork,
  mapReview,
  mapCert,
  serializeTrainerSummary,
  serializeTrainerDetail,
};
