// Generates and stores embeddings for every listing that does not have one yet.
import pg from 'pg';
import { embed } from '../lib/embed.js';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(
  `SELECT listing_id, title, description FROM listings
   WHERE listing_id NOT IN (SELECT listing_id FROM listing_embeddings)`);
for (const r of rows) {
  const v = await embed(`${r.title}. ${r.description}`);
  await client.query('INSERT INTO listing_embeddings(listing_id, embedding) VALUES ($1, $2::vector)', [r.listing_id, v]);
  console.log('embedded listing', r.listing_id);
}
await client.end();
