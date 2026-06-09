import { Pool, types, type QueryResult } from 'pg';

/*
 * Postgres (Supabase) data layer.
 *
 * This module exposes a *small* async surface that mirrors the slice of the
 * better-sqlite3 API the app was built on — `db.prepare(sql).get/all/run(...)`,
 * `db.exec(sql)` and `db.transaction(fn)` — so the ~200 existing call sites only
 * needed an `await` added rather than a full rewrite. The shim translates:
 *   • `?`        positional placeholders → `$1, $2, …`
 *   • `@name`    named placeholders (single object arg) → `$1, $2, …`
 *   • INSERTs    get `RETURNING id` appended so `.run()` can report
 *                `lastInsertRowid`, except for the id-less junction tables.
 */

// pg returns bigint (COUNT) and numeric (AVG) as strings to preserve precision.
// Our ids/counts/ratings are small, so parse them back to JS numbers — otherwise
// `COUNT(*) AS c` would yield "4" and every `row.c` comparison would silently break.
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // int8 / bigint
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric

declare global {
  // Reuse one pool across dev hot-reloads and warm serverless invocations.
  // eslint-disable-next-line no-var
  var __traineruniverse_pool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!connectionString) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. Add your Supabase connection string to .env.local (see .env.example).'
    );
  }
  return new Pool({
    connectionString,
    // Supabase requires TLS; don't reject the cert chain so it works from any host.
    ssl: { rejectUnauthorized: false },
    // Serverless instances should hold a tiny pool; a long-lived server can hold more.
    max: process.env.VERCEL ? 1 : 10,
  });
}

const pool = globalThis.__traineruniverse_pool ?? createPool();
if (process.env.NODE_ENV !== 'production') globalThis.__traineruniverse_pool = pool;

// `text` runs raw SQL on the simple protocol when no values are given (allows
// multiple statements); switches to the extended protocol once values exist.
type RawExec = (text: string, values?: unknown[]) => Promise<QueryResult>;

// Junction tables have composite PKs and no `id` column, so `RETURNING id` is invalid there.
const NO_ID_TABLES = new Set(['trainer_specialties', 'trainer_students']);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    !Buffer.isBuffer(v) &&
    Object.getPrototypeOf(v) === Object.prototype
  );
}

// Replace `?` placeholders that sit outside quoted string literals.
function replacePositional(sql: string): string {
  let out = '';
  let n = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (ch === '?' && !inSingle && !inDouble) out += `$${++n}`;
    else out += ch;
  }
  return out;
}

// Translate (sql, args) from better-sqlite3 form into pg { text, values }.
function build(sql: string, args: unknown[]): { text: string; values: unknown[] } {
  if (args.length === 1 && isPlainObject(args[0])) {
    const obj = args[0];
    const values: unknown[] = [];
    const text = sql.replace(/@(\w+)/g, (_m, name: string) => {
      values.push(obj[name]);
      return `$${values.length}`;
    });
    return { text, values };
  }
  return { text: replacePositional(sql), values: args };
}

function insertTarget(sql: string): string | null {
  const m = /^\s*insert\s+into\s+"?([a-z_][a-z0-9_]*)"?/i.exec(sql);
  return m ? m[1].toLowerCase() : null;
}

class Statement {
  constructor(private readonly exec: RawExec, private readonly sql: string) {}

  async get(...args: unknown[]): Promise<unknown> {
    const { text, values } = build(this.sql, args);
    const res = await this.exec(text, values);
    return res.rows[0];
  }

  async all(...args: unknown[]): Promise<unknown[]> {
    const { text, values } = build(this.sql, args);
    const res = await this.exec(text, values);
    return res.rows;
  }

  async run(...args: unknown[]): Promise<{ changes: number; lastInsertRowid: number | undefined }> {
    const built = build(this.sql, args);
    let text = built.text;
    const values = built.values;
    const table = insertTarget(text);
    if (table && !NO_ID_TABLES.has(table) && !/\breturning\b/i.test(text)) {
      text += ' RETURNING id';
    }
    const res = await this.exec(text, values);
    return {
      changes: res.rowCount ?? 0,
      lastInsertRowid: (res.rows[0] as { id?: number } | undefined)?.id,
    };
  }
}

export interface Querier {
  prepare(sql: string): Statement;
  exec(sql: string): Promise<void>;
}

function makeQuerier(exec: RawExec): Querier {
  return {
    prepare: (sql: string) => new Statement(exec, sql),
    exec: async (sql: string) => {
      await exec(sql); // no values → simple protocol → multiple statements allowed
    },
  };
}

const poolExec: RawExec = (text, values) =>
  values === undefined ? pool.query(text) : pool.query(text, values);

const db = {
  ...makeQuerier(poolExec),
  /** Run `fn` inside a single BEGIN/COMMIT on a dedicated connection. */
  async transaction<T>(fn: (tx: Querier) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    const clientExec: RawExec = (text, values) =>
      values === undefined ? client.query(text) : client.query(text, values);
    try {
      await client.query('BEGIN');
      const result = await fn(makeQuerier(clientExec));
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* ignore rollback failure */
      }
      throw err;
    } finally {
      client.release();
    }
  },
  pool,
};

export default db;
