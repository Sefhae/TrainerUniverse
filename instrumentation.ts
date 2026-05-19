export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: db } = await import('./src/lib/db');
    const trainers = db.prepare('SELECT COUNT(*) AS c FROM trainer_profiles').get() as { c: number };
    const students = db.prepare('SELECT COUNT(*) AS c FROM student_profiles').get() as { c: number };
    if (trainers.c === 0 || students.c === 0) {
      console.log('[traineruniverse] Seeding sample data…');
      const { seed } = await import('./src/lib/seed');
      seed();
      console.log('[traineruniverse] Seed complete.');
    }
  }
}
