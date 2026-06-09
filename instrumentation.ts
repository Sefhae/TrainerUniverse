export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Provision the Postgres schema (idempotent), then seed sample data only if
    // the database is brand-new and empty. ensureSeeded() takes an advisory lock
    // and re-checks emptiness, so it can never wipe real, user-created accounts.
    //
    // Wrapped in try/catch so an unreachable database at boot only logs — it must
    // not crash the whole server. Routes will surface their own errors until the
    // DB is reachable.
    try {
      const { ensureSchema } = await import('./src/lib/schema');
      await ensureSchema();

      const { ensureSeeded } = await import('./src/lib/seed');
      const seeded = await ensureSeeded();
      if (seeded) console.log('[traineruniverse] Empty database — seeded sample data.');
    } catch (err) {
      console.error(
        '[traineruniverse] Skipped DB init — could not reach the database. ' +
          'Check DATABASE_URL (use the Supabase pooler host on IPv4 networks).',
        err instanceof Error ? err.message : err
      );
    }
  }
}
