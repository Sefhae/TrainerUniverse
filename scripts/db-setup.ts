/*
 * One-time (idempotent) Supabase/Postgres provisioning.
 *   npm run db:setup
 * Creates the schema if missing, then seeds sample data only if the DB is empty.
 * Reads DATABASE_URL from .env.local / .env (loaded the same way Next.js does).
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function main() {
  const { ensureSchema } = await import('../src/lib/schema');
  const { ensureSeeded } = await import('../src/lib/seed');
  const { default: db } = await import('../src/lib/db');

  console.log('→ Ensuring schema…');
  await ensureSchema();

  console.log('→ Seeding (only if empty)…');
  const seeded = await ensureSeeded();
  console.log(seeded ? '✓ Seeded sample data.' : '✓ Database already had data — left untouched.');

  await db.pool.end();
  console.log('✓ Done.');
}

main().catch((err) => {
  console.error('✗ db:setup failed:', err);
  process.exit(1);
});
