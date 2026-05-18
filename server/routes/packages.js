const express = require('express');
const db = require('../db/database');
const { requireAuth, requireTrainerOwner } = require('../middleware/auth');
const { mapPackage } = require('../lib/serialize');

const router = express.Router({ mergeParams: true });

// GET /api/trainers/:id/packages
router.get('/', (req, res) => {
  const trainerId = Number(req.params.id);
  const rows = db
    .prepare('SELECT * FROM pricing_packages WHERE trainer_id = ? ORDER BY price ASC')
    .all(trainerId)
    .map(mapPackage);
  res.json(rows);
});

// POST /api/trainers/:id/packages
router.post('/', requireAuth, requireTrainerOwner, (req, res) => {
  const trainerId = Number(req.params.id);
  const { name, description, sessions, price, isPopular } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Package name is required.' });
  }
  const info = db
    .prepare(`
      INSERT INTO pricing_packages (trainer_id, name, description, sessions, price, is_popular)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      trainerId,
      String(name).trim(),
      description ? String(description) : '',
      Math.max(0, Number(sessions) || 0),
      Math.max(0, Number(price) || 0),
      isPopular ? 1 : 0
    );
  const created = db.prepare('SELECT * FROM pricing_packages WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(mapPackage(created));
});

// PUT /api/trainers/:id/packages/:packageId
router.put('/:packageId', requireAuth, requireTrainerOwner, (req, res) => {
  const trainerId = Number(req.params.id);
  const packageId = Number(req.params.packageId);
  const existing = db
    .prepare('SELECT * FROM pricing_packages WHERE id = ? AND trainer_id = ?')
    .get(packageId, trainerId);
  if (!existing) return res.status(404).json({ error: 'Package not found.' });

  const { name, description, sessions, price, isPopular } = req.body || {};
  db.prepare(`
    UPDATE pricing_packages SET name = ?, description = ?, sessions = ?, price = ?, is_popular = ?
    WHERE id = ?
  `).run(
    name !== undefined ? String(name) : existing.name,
    description !== undefined ? String(description) : existing.description,
    sessions !== undefined ? Math.max(0, Number(sessions) || 0) : existing.sessions,
    price !== undefined ? Math.max(0, Number(price) || 0) : existing.price,
    isPopular !== undefined ? (isPopular ? 1 : 0) : existing.is_popular,
    packageId
  );
  const updated = db.prepare('SELECT * FROM pricing_packages WHERE id = ?').get(packageId);
  res.json(mapPackage(updated));
});

// DELETE /api/trainers/:id/packages/:packageId
router.delete('/:packageId', requireAuth, requireTrainerOwner, (req, res) => {
  const trainerId = Number(req.params.id);
  const packageId = Number(req.params.packageId);
  const info = db
    .prepare('DELETE FROM pricing_packages WHERE id = ? AND trainer_id = ?')
    .run(packageId, trainerId);
  if (!info.changes) return res.status(404).json({ error: 'Package not found.' });
  res.json({ success: true });
});

module.exports = router;
