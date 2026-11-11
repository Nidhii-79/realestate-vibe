import { query } from '@/lib/db';

export async function GET(_req, { params }) {
  const { rows } = await query(
    `SELECT l.*, n.name AS neighborhood, n.city, u.full_name AS agent_name, a.agency_name
     FROM listings l JOIN neighborhoods n USING (neighborhood_id)
     JOIN agents a USING (agent_id) JOIN users u ON u.user_id = a.user_id
     WHERE l.listing_id = $1`, [params.id]);
  if (!rows.length) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(rows[0]);
}
