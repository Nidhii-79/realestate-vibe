// Runs db/01..04 SQL files in order. WARNING: 01_schema.sql drops and recreates all tables.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const dir = path.join(process.cwd(), 'db');
const files = fs.readdirSync(dir).filter((f) => /^0[1-4]_.*\.sql$/.test(f)).sort();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
for (const f of files) {
  await client.query(fs.readFileSync(path.join(dir, f), 'utf8'));
  console.log('ran', f);
}
await client.end();
