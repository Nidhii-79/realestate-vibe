import { query, pool } from '@/lib/db';
import { embed } from '@/lib/embed';
import { requireRole } from '@/lib/auth';

async function agentIdOf(userId) {
  const { rows } = await query('SELECT agent_id FROM agents WHERE user_id=$1', [userId]);
  return rows[0]?.agent_id;
}

export async function GET() {
  const u = await requireRole('agent');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const agentId = await agentIdOf(u.id);
  const listings = (await query(
    `SELECT l.listing_id, l.title, l.price, l.status, l.bedrooms, n.name AS neighborhood
     FROM listings l JOIN neighborhoods n USING (neighborhood_id) WHERE l.agent_id=$1 ORDER BY l.listing_id DESC`, [agentId])).rows;
  const neighborhoods = (await query('SELECT neighborhood_id, name FROM neighborhoods ORDER BY name')).rows;
  return Response.json({ listings, neighborhoods });
}

// POST: create listing + its embedding + 3 viewing slots in ONE transaction
export async function POST(req) {
  const u = await requireRole('agent');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json();
  const agentId = await agentIdOf(u.id);
  const client = await pool.connect();
  try {
    const vec = await embed(`${b.title}. ${b.description}`);
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO listings(agent_id,neighborhood_id,title,description,property_type,price,bedrooms,bathrooms,area_sqft)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING listing_id`,
      [agentId, b.neighborhoodId, b.title, b.description, b.propertyType, b.price, b.bedrooms, b.bathrooms, b.areaSqft || null]);
    const id = r.rows[0].listing_id;
    await client.query('INSERT INTO listing_embeddings(listing_id, embedding) VALUES ($1,$2::vector)', [id, vec]);
    for (let d = 1; d <= 3; d++)
      await client.query("INSERT INTO viewing_slots(listing_id, slot_start) VALUES ($1, date_trunc('day', now()) + ($2 || ' days')::interval + interval '11 hours')", [id, String(d)]);
    await client.query('COMMIT');
    return Response.json({ listing_id: id });
  } catch (e) {
    await client.query('ROLLBACK');
    // database CHECK / NOT NULL / FK constraints are our validation layer
    return Response.json({ error: 'Rejected by database: ' + e.message }, { status: 400 });
  } finally { client.release(); }
}

// PATCH {listingId, price}: change price (fires trg_price_change -> history + alerts). Owner only.
export async function PATCH(req) {
  const u = await requireRole('agent');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { listingId, price } = await req.json();
  try {
    const r = await query('UPDATE listings SET price=$1 WHERE listing_id=$2 AND agent_id=$3', [price, listingId, await agentIdOf(u.id)]);
    if (!r.rowCount) return Response.json({ error: 'Not your listing' }, { status: 403 });
    return Response.json({ ok: true });
  } catch (e) { return Response.json({ error: 'Rejected by database: ' + e.message }, { status: 400 }); }
}
