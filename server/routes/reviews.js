const express = require('express');
const db = require('../db/database');
const { mapReview } = require('../lib/serialize');

const router = express.Router({ mergeParams: true });

// GET /api/trainers/:id/reviews
router.get('/', (req, res) => {
  const trainerId = Number(req.params.id);
  const rows = db
    .prepare('SELECT * FROM reviews WHERE trainer_id = ? ORDER BY created_at DESC')
    .all(trainerId)
    .map(mapReview);
  res.json(rows);
});

// POST /api/trainers/:id/reviews — public, anyone can leave a review
router.post('/', (req, res) => {
  const trainerId = Number(req.params.id);
  const trainer = db.prepare('SELECT id FROM trainer_profiles WHERE id = ?').get(trainerId);
  if (!trainer) return res.status(404).json({ error: 'Trainer not found.' });

  const { reviewerName, rating, comment } = req.body || {};
  if (!reviewerName || !String(reviewerName).trim()) {
    return res.status(400).json({ error: 'Your name is required.' });
  }
  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Please choose a rating between 1 and 5 stars.' });
  }
  if (!comment || !String(comment).trim()) {
    return res.status(400).json({ error: 'Please write a short comment.' });
  }

  const info = db
    .prepare('INSERT INTO reviews (trainer_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)')
    .run(trainerId, String(reviewerName).trim(), Math.round(numericRating), String(comment).trim());
  const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(mapReview(created));
});

module.exports = router;
