import db from './db';

/*
 * Postgres translation of the original SQLite schema. Differences from the
 * better-sqlite3 version:
 *   • INTEGER PRIMARY KEY AUTOINCREMENT      → SERIAL PRIMARY KEY
 *   • REAL                                   → double precision
 *   • DEFAULT (datetime('now'))              → an ISO-8601 UTC string default
 *   • the post-hoc ALTER TABLE columns       → folded into the table definitions
 * Boolean-ish flags stay as integer 0/1 to match the existing query/serialize code.
 */

// Mirrors SQLite's datetime('now') role but emits an unambiguous UTC ISO string.
const NOW = `to_char((now() AT TIME ZONE 'utc'), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'trainer',
  created_at    TEXT NOT NULL DEFAULT ${NOW}
);

CREATE TABLE IF NOT EXISTS trainer_profiles (
  id               SERIAL PRIMARY KEY,
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
  is_verified      INTEGER NOT NULL DEFAULT 0,
  response_time    TEXT NOT NULL DEFAULT 'within 24 hours',
  created_at       TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS specialties (
  id   SERIAL PRIMARY KEY,
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
  id          SERIAL PRIMARY KEY,
  trainer_id  INTEGER NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sessions    INTEGER NOT NULL DEFAULT 1,
  price       DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_popular  INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS previous_work (
  id            SERIAL PRIMARY KEY,
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
  id            SERIAL PRIMARY KEY,
  trainer_id    INTEGER NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating        INTEGER NOT NULL,
  comment       TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certifications (
  id         SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL,
  name       TEXT NOT NULL,
  issuer     TEXT NOT NULL DEFAULT '',
  year       INTEGER,
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  profile_photo TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trainer_students (
  trainer_id  INTEGER NOT NULL,
  student_id  INTEGER NOT NULL,
  enrolled_at TEXT NOT NULL DEFAULT ${NOW},
  PRIMARY KEY (trainer_id, student_id),
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id           SERIAL PRIMARY KEY,
  trainer_id   INTEGER NOT NULL,
  student_id   INTEGER NOT NULL,
  title        TEXT NOT NULL DEFAULT 'Training Session',
  scheduled_at TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 60,
  status       TEXT NOT NULL DEFAULT 'confirmed',
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_change_requests (
  id           SERIAL PRIMARY KEY,
  session_id   INTEGER NOT NULL,
  requested_by TEXT NOT NULL,
  proposed_at  TEXT NOT NULL,
  message      TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  sender     TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT ${NOW}
);

CREATE TABLE IF NOT EXISTS session_requests (
  id         SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  package_id INTEGER,
  message    TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES pricing_packages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_removal_requests (
  id         SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  reason     TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT ${NOW},
  FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);
`;

/** Create every table if it does not already exist. Idempotent and safe to re-run. */
export async function ensureSchema(): Promise<void> {
  await db.exec(SCHEMA_SQL);
}
