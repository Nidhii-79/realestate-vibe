import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const u = await requireRole('buyer');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await query(
    `SELECT l.listing_id, l.title, l.price, l.bedrooms, n.name AS neighborhood
     FROM saved_listings s JOIN listings l USING (listing_id) JOIN neighborhoods n USING (neighborhood_id)
     WHERE s.buyer_id=$1`, [u.id]);
  return Response.json(rows);
}

// POST toggles save/unsave
export async function POST(req) {
  const u = await requireRole('buyer');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { listingId } = await req.json();
  const del = await query('DELETE FROM saved_listings WHERE buyer_id=$1 AND listing_id=$2', [u.id, listingId]);
  if (del.rowCount) return Response.json({ saved: false });
  await query('INSERT INTO saved_listings VALUES ($1,$2)', [u.id, listingId]);
  return Response.json({ saved: true });
}
