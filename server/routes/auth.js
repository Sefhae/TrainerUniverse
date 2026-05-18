const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();
const EMAIL_RE = /^\S+@\S+\.\S+$/;

router.post('/register', (req, res) => {
  const { name, email, password, specialties } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Your name is required.' });
  }
  if (!email || !EMAIL_RE.test(String(email))) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(String(password), 10);

  const create = db.transaction(() => {
    const userId = db
      .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run(normalizedEmail, passwordHash, 'trainer').lastInsertRowid;

    const trainerId = db
      .prepare('INSERT INTO trainer_profiles (user_id, name, is_published) VALUES (?, ?, 0)')
      .run(userId, String(name).trim()).lastInsertRowid;

    if (Array.isArray(specialties)) {
      const findSpec = db.prepare('SELECT id FROM specialties WHERE name = ?');
      const link = db.prepare('INSERT OR IGNORE INTO trainer_specialties (trainer_id, specialty_id) VALUES (?, ?)');
      for (const name of specialties) {
        const row = findSpec.get(name);
        if (row) link.run(trainerId, row.id);
      }
    }
    return { userId, trainerId };
  });

  const { userId, trainerId } = create();
  const token = signToken({ userId, role: 'trainer', trainerId });
  res.status(201).json({
    token,
    user: { id: userId, email: normalizedEmail, role: 'trainer' },
    trainerId,
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const profile = db.prepare('SELECT id FROM trainer_profiles WHERE user_id = ?').get(user.id);
  const trainerId = profile ? profile.id : null;
  const token = signToken({ userId: user.id, role: user.role, trainerId });
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
    trainerId,
  });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(req.user.userId);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user, trainerId: req.user.trainerId });
});

module.exports = router;
