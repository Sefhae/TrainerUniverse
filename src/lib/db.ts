import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

declare global {
  var __fitconnect_db: Database.Database | undefined;
}

function resolveDbPath(): string {
  const sourcePath = process.env.DB_PATH || path.join(process.cwd(), 'server', 'db', 'fitconnect.db');
  // Vercel's deployed filesystem is read-only; copy the db to /tmp (writable) once per instance.
  if (process.env.VERCEL) {
    const tmpPath = '/tmp/fitconnect.db';
    if (!fs.existsSync(tmpPath)) {
      fs.copyFileSync(sourcePath, tmpPath);
    }
    return tmpPath;
  }
  return sourcePath;
}

function createDb() {
  const dbPath = resolveDbPath();
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'trainer',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trainer_profiles (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL,
      name             TEXT NOT NULL,
      tagline          TEXT NOT NULL DEFAULT '',
      bio              TEXT NOT NULL DEFAULT '',
      profile_photo    TEXT NOT NULL DEFAULT '',
      cover_photo      TEXT NOT NULL DEFAULT '',
      location         TEXT NOT NULL DEFAULT '',
      is_remote        INTEGER NOT NULL DEFAULT 0,
      years_experience INTEGER NOT NULL DEFAULT 0,
      availability     TEXT NOT NULL DEFAULT '[]',
      is_published     INTEGER NOT NULL DEFAULT 1,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS specialties (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trainer_specialties (
      trainer_id   INTEGER NOT NULL,
      specialty_id INTEGER NOT NULL,
      PRIMARY KEY (trainer_id, specialty_id),
      FOREIGN KEY (trainer_id)   REFERENCES trainer_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (specialty_id) REFERENCES specialties(id)      ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pricing_packages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id  INTEGER NOT NULL,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sessions    INTEGER NOT NULL DEFAULT 1,
      price       REAL NOT NULL DEFAULT 0,
      is_popular  INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS previous_work (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id    INTEGER NOT NULL,
      photo         TEXT NOT NULL DEFAULT '',
      student_name  TEXT NOT NULL DEFAULT '',
      goal          TEXT NOT NULL DEFAULT '',
      duration      TEXT NOT NULL DEFAULT '',
      description   TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible    INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id    INTEGER NOT NULL,
      reviewer_name TEXT NOT NULL,
      rating        INTEGER NOT NULL,
      comment       TEXT NOT NULL DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id INTEGER NOT NULL,
      name       TEXT NOT NULL,
      issuer     TEXT NOT NULL DEFAULT '',
      year       INTEGER,
      FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE
    );
  `);

  return db;
}

const db = globalThis.__fitconnect_db ?? createDb();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__fitconnect_db = db;
}

export default db;
