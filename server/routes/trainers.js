const express = require('express');
const db = require('../db/database');
const { requireAuth, requireTrainerOwner } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { serializeTrainerSummary, serializeTrainerDetail } = require('../lib/serialize');

const router = express.Router();

function experienceBucket(years) {
  if (years <= 3) return '1-3';
  if (years <= 7) return '3-7';
  return '7+';
}

const csv = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

// GET /api/trainers — public listing with filters + sorting
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM trainer_profiles WHERE is_published = 1').all();
  let trainers = rows.map(serializeTrainerSummary);

  const { specialty, minPrice, maxPrice, mode, minRating, availability, experience, sort } = req.query;

  const wantedSpecialties = csv(specialty);
  if (wantedSpecialties.length) {
    trainers = trainers.filter((t) =>
      t.specialties.some((s) => wantedSpecialties.includes(s.name.toLowerCase()))
    );
  }

  if (minPrice) trainers = trainers.filter((t) => t.startingPrice >= Number(minPrice));
  if (maxPrice) trainers = trainers.filter((t) => t.startingPrice <= Number(maxPrice));

  if (mode === 'remote') trainers = trainers.filter((t) => t.isRemote);
  if (mode === 'in-person') trainers = trainers.filter((t) => !t.isRemote);

  if (minRating) trainers = trainers.filter((t) => t.rating >= Number(minRating));

  const wantedAvailability = csv(availability);
  if (wantedAvailability.length) {
    trainers = trainers.filter((t) =>
      wantedAvailability.some((a) => t.availability.includes(a))
    );
  }

  const wantedExperience = csv(experience);
  if (wantedExperience.length) {
    trainers = trainers.filter((t) => wantedExperience.includes(experienceBucket(t.yearsExperience)));
  }

  switch (sort) {
    case 'price-asc':
      trainers.sort((a, b) => a.startingPrice - b.startingPrice);
      break;
    case 'price-desc':
      trainers.sort((a, b) => b.startingPrice - a.startingPrice);
      break;
    case 'most-reviewed':
      trainers.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'newest':
      trainers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id);
      break;
    case 'top-rated':
    default:
      trainers.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
  }

  res.json({ trainers, total: trainers.length });
});

// GET /api/trainers/:id — full public profile
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Trainer not found.' });
  res.json(serializeTrainerDetail(row));
});

// PUT /api/trainers/:id — update profile (owner only)
router.put('/:id', requireAuth, requireTrainerOwner, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Trainer not found.' });

  const { name, tagline, bio, location, isRemote, yearsExperience, availability, isPublished, specialties } = req.body || {};

  db.prepare(`
    UPDATE trainer_profiles SET
      name = ?, tagline = ?, bio = ?, location = ?,
      is_remote = ?, years_experience = ?, availability = ?, is_published = ?
    WHERE id = ?
  `).run(
    name !== undefined ? String(name) : existing.name,
    tagline !== undefined ? String(tagline) : existing.tagline,
    bio !== undefined ? String(bio) : existing.bio,
    location !== undefined ? String(location) : existing.location,
    isRemote !== undefined ? (isRemote ? 1 : 0) : existing.is_remote,
    yearsExperience !== undefined ? Number(yearsExperience) || 0 : existing.years_experience,
    availability !== undefined ? JSON.stringify(Array.isArray(availability) ? availability : []) : existing.availability,
    isPublished !== undefined ? (isPublished ? 1 : 0) : existing.is_published,
    id
  );

  if (Array.isArray(specialties)) {
    db.prepare('DELETE FROM trainer_specialties WHERE trainer_id = ?').run(id);
    const findSpec = db.prepare('SELECT id FROM specialties WHERE name = ?');
    const link = db.prepare('INSERT OR IGNORE INTO trainer_specialties (trainer_id, specialty_id) VALUES (?, ?)');
    for (const sName of specialties) {
      const row = findSpec.get(sName);
      if (row) link.run(id, row.id);
    }
  }

  const updated = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(id);
  res.json(serializeTrainerDetail(updated));
});

// POST /api/trainers/:id/photos — upload profile and/or cover photo (owner only)
router.post(
  '/:id/photos',
  requireAuth,
  requireTrainerOwner,
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  (req, res) => {
    const id = Number(req.params.id);
    const files = req.files || {};
    let changed = false;

    if (files.profilePhoto && files.profilePhoto[0]) {
      db.prepare('UPDATE trainer_profiles SET profile_photo = ? WHERE id = ?')
        .run(`/uploads/${files.profilePhoto[0].filename}`, id);
      changed = true;
    }
    if (files.coverPhoto && files.coverPhoto[0]) {
      db.prepare('UPDATE trainer_profiles SET cover_photo = ? WHERE id = ?')
        .run(`/uploads/${files.coverPhoto[0].filename}`, id);
      changed = true;
    }
    if (!changed) return res.status(400).json({ error: 'No image file was provided.' });

    const updated = db.prepare('SELECT * FROM trainer_profiles WHERE id = ?').get(id);
    res.json(serializeTrainerDetail(updated));
  }
);

module.exports = router;
