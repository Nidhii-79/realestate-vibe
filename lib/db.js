import pg from 'pg';

// Single shared pool (reused across hot reloads in dev). Credentials come from env vars only.
const g = globalThis;
export const pool = g.__pgPool ?? (g.__pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL }));
export const query = (text, params) => pool.query(text, params);
