export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: db } = await import('./src/lib/db');
    // IMPORTANT: seed() does a full wipe (DELETE FROM users, …) before inserting
    // sample data. Only run it on a brand-new, completely empty database so it
    // can never delete real, user-created accounts. (Previously this re-seeded
    // whenever trainers OR students hit zero, which could wipe everything.)
    const users = db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number };
    if (users.c === 0) {
      console.log('[traineruniverse] Empty database — seeding sample data…');
      const { seed } = await import('./src/lib/seed');
      seed();
      console.log('[traineruniverse] Seed complete.');
    }
  }
}
