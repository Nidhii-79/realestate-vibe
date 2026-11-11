import { query } from '@/lib/db';

// Full-text search using the GIN-indexed tsvector column, ranked with ts_rank
export async function GET(req) {
  const q = new URL(req.url).searchParams.get('q');
  if (!q) return Response.json([]);
  const { rows } = await query(
    `SELECT l.listing_id, l.title, l.price, l.bedrooms, n.name AS neighborhood,
            ts_rank(l.search_tsv, plainto_tsquery('english', $1)) AS rank
     FROM listings l JOIN neighborhoods n USING (neighborhood_id)
     WHERE l.status = 'active' AND l.search_tsv @@ plainto_tsquery('english', $1)
     ORDER BY rank DESC LIMIT 20`, [q]);
  return Response.json(rows);
}
