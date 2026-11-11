import { query } from '@/lib/db';
import { embed } from '@/lib/embed';

// HYBRID SEARCH: SQL filters (price, bedrooms, type, status) + vector similarity ranking (cosine distance <=>)
export async function POST(req) {
  try {
    const b = await req.json();
    if (!b.vibe || !String(b.vibe).trim()) return Response.json({ error: 'Describe a vibe to search' }, { status: 400 });
    const v = await embed(String(b.vibe));
    const { rows } = await query(
      `SELECT l.listing_id, l.title, l.price, l.bedrooms, l.property_type, n.name AS neighborhood,
              ROUND((1 - (e.embedding <=> $1::vector))::numeric, 3) AS similarity
       FROM listings l
       JOIN listing_embeddings e USING (listing_id)
       JOIN neighborhoods n USING (neighborhood_id)
       WHERE l.status = 'active'
         AND l.price >= COALESCE($2::numeric, 0)
         AND l.price <= COALESCE($3::numeric, 1e12)
         AND l.bedrooms >= COALESCE($4::int, 0)
         AND ($5::text IS NULL OR l.property_type = $5)
       ORDER BY e.embedding <=> $1::vector
       LIMIT 10`,
      [v, b.minPrice || null, b.maxPrice || null, b.minBeds || null, b.type || null]);
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
