import { query } from '@/lib/db';

// GET /api/listings?q=&minPrice=&maxPrice=&minBeds=&type=   (structured browse; q = full-text search)
export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const q = p.get('q');
  const { rows } = await query(
    `SELECT l.listing_id, l.title, l.price, l.bedrooms, l.property_type, n.name AS neighborhood
     FROM listings l JOIN neighborhoods n USING (neighborhood_id)
     WHERE l.status = 'active'
       AND l.price >= COALESCE($1::numeric, 0)
       AND l.price <= COALESCE($2::numeric, 1e12)
       AND l.bedrooms >= COALESCE($3::int, 0)
       AND ($4::text IS NULL OR l.property_type = $4)
       AND ($5::text IS NULL OR l.search_tsv @@ plainto_tsquery('english', $5))
     ORDER BY l.created_at DESC, l.listing_id`,
    [p.get('minPrice') || null, p.get('maxPrice') || null, p.get('minBeds') || null, p.get('type') || null, q || null]);
  return Response.json(rows);
}
