const express = require('express');
const cors = require('cors');
const db = require('./db/database');
const { seed } = require('./db/seed');
const { uploadDir } = require('./middleware/upload');

const authRoutes = require('./routes/auth');
const trainerRoutes = require('./routes/trainers');
const packageRoutes = require('./routes/packages');
const workRoutes = require('./routes/work');
const reviewRoutes = require('./routes/reviews');

const app = express();
// Use a dedicated variable so the API is not affected by a PORT injected for the web app.
const PORT = process.env.API_PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadDir));

// Seed sample data automatically the first time the server starts.
const trainerCount = db.prepare('SELECT COUNT(*) AS c FROM trainer_profiles').get().c;
if (trainerCount === 0) {
  console.log('Empty database detected — seeding sample data...');
  seed();
  console.log('Seed complete.');
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/specialties', (req, res) => {
  res.json(db.prepare('SELECT id, name FROM specialties ORDER BY name').all());
});

app.use('/api/auth', authRoutes);
app.use('/api/trainers/:id/packages', packageRoutes);
app.use('/api/trainers/:id/work', workRoutes);
app.use('/api/trainers/:id/reviews', reviewRoutes);
app.use('/api/trainers', trainerRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Centralized error handler (Multer errors, thrown route errors, etc.)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'That image is too large (6MB maximum).' });
  }
  res.status(err.status || 400).json({ error: err.message || 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`FitConnect API running at http://localhost:${PORT}`);
});
