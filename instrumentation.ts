export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: db } = await import('./src/lib/db');
    const row = db.prepare('SELECT COUNT(*) AS c FROM trainer_profiles').get() as { c: number };
    if (row.c === 0) {
      console.log('[fitconnect] Empty database — seeding sample data…');
      const { seed } = await import('./src/lib/seed');
      seed();
      console.log('[fitconnect] Seed complete.');
    }
  }
}
