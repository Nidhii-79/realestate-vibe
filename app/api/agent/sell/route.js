import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// POST {listingId, buyerEmail, price}: calls stored procedure sp_record_sale (atomic)
export async function POST(req) {
  const u = await requireRole('agent');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { listingId, buyerEmail, price } = await req.json();
  const own = await query('SELECT 1 FROM listings l JOIN agents a USING (agent_id) WHERE l.listing_id=$1 AND a.user_id=$2', [listingId, u.id]);
  if (!own.rowCount) return Response.json({ error: 'Not your listing' }, { status: 403 });
  const buyer = await query("SELECT user_id FROM users WHERE email=$1 AND role='buyer'", [String(buyerEmail).toLowerCase()]);
  if (!buyer.rowCount) return Response.json({ error: 'No buyer with that email' }, { status: 400 });
  try {
    await query('CALL sp_record_sale($1,$2,$3)', [listingId, buyer.rows[0].user_id, price]);
    return Response.json({ ok: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 400 }); }
}
