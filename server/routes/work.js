const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('../db/database');
const { requireAuth, requireTrainerOwner } = require('../middleware/auth');
const { upload, uploadDir } = require('../middleware/upload');
const { mapWork } = require('../lib/serialize');

const router = express.Router({ mergeParams: true });

// Multipart sends booleans as strings; normalize them.
function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1;
}

// GET /api/trainers/:id/work
router.get('/', (req, res) => {
  const trainerId = Number(req.params.id);
  const rows = db
    .prepare('SELECT * FROM previous_work WHERE trainer_id = ? ORDER BY display_order ASC, id ASC')
    .all(trainerId)
    .map(mapWork);
  res.json(rows);
});

// POST /api/trainers/:id/work — accepts an optional "photo" file (multipart)
router.post('/', requireAuth, requireTrainerOwner, upload.single('photo'), (req, res) => {
  const trainerId = Number(req.params.id);
  const { studentName, goal, duration, description, isVisible, displayOrder, photo } = req.body || {};

  let photoPath = photo ? String(photo) : '';
  if (req.file) photoPath = `/uploads/${req.file.filename}`;

  const order =
    displayOrder !== undefined
      ? Number(displayOrder) || 0
      : db.prepare('SELECT COUNT(*) AS c FROM previous_work WHERE trainer_id = ?').get(trainerId).c;

  const info = db
    .prepare(`
      INSERT INTO previous_work
        (trainer_id, photo, student_name, goal, duration, description, display_order, is_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      trainerId,
      photoPath,
      studentName ? String(studentName) : '',
      goal ? String(goal) : '',
      duration ? String(duration) : '',
      description ? String(description) : '',
      order,
      parseBool(isVisible, true) ? 1 : 0
    );
  const created = db.prepare('SELECT * FROM previous_work WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(mapWork(created));
});

// PUT /api/trainers/:id/work/:workId — accepts an optional "photo" file (multipart) or plain JSON
router.put('/:workId', requireAuth, requireTrainerOwner, upload.single('photo'), (req, res) => {
  const trainerId = Number(req.params.id);
  const workId = Number(req.params.workId);
  const existing = db
    .prepare('SELECT * FROM previous_work WHERE id = ? AND trainer_id = ?')
    .get(workId, trainerId);
  if (!existing) return res.status(404).json({ error: 'Work entry not found.' });

  const { studentName, goal, duration, description, isVisible, displayOrder, photo } = req.body || {};

  let photoPath = existing.photo;
  if (req.file) photoPath = `/uploads/${req.file.filename}`;
  else if (photo !== undefined) photoPath = String(photo);

  db.prepare(`
    UPDATE previous_work SET
      photo = ?, student_name = ?, goal = ?, duration = ?, description = ?, display_order = ?, is_visible = ?
    WHERE id = ?
  `).run(
    photoPath,
    studentName !== undefined ? String(studentName) : existing.student_name,
    goal !== undefined ? String(goal) : existing.goal,
    duration !== undefined ? String(duration) : existing.duration,
    description !== undefined ? String(description) : existing.description,
    displayOrder !== undefined ? Number(displayOrder) || 0 : existing.display_order,
    isVisible !== undefined ? (parseBool(isVisible) ? 1 : 0) : existing.is_visible,
    workId
  );
  const updated = db.prepare('SELECT * FROM previous_work WHERE id = ?').get(workId);
  res.json(mapWork(updated));
});

// DELETE /api/trainers/:id/work/:workId
router.delete('/:workId', requireAuth, requireTrainerOwner, (req, res) => {
  const trainerId = Number(req.params.id);
  const workId = Number(req.params.workId);
  const existing = db
    .prepare('SELECT * FROM previous_work WHERE id = ? AND trainer_id = ?')
    .get(workId, trainerId);
  if (!existing) return res.status(404).json({ error: 'Work entry not found.' });

  db.prepare('DELETE FROM previous_work WHERE id = ?').run(workId);

  if (existing.photo && existing.photo.startsWith('/uploads/')) {
    fs.unlink(path.join(uploadDir, path.basename(existing.photo)), () => {});
  }
  res.json({ success: true });
});

module.exports = router;
