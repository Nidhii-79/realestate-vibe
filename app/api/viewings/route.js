import { pool, query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// POST: book a viewing slot inside a transaction. FOR UPDATE row-locks the slot so two buyers
// cannot book it simultaneously (second one waits, then sees is_booked = true and is rolled back).
export async function POST(req) {
  const user = await requireRole('buyer');
  if (!user) return Response.json({ error: 'Log in as a buyer to book' }, { status: 401 });
  const { slotId } = await req.json();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT is_booked FROM viewing_slots WHERE slot_id=$1 FOR UPDATE', [slotId]);
    if (!rows.length) throw new Error('Slot not found');
    if (rows[0].is_booked) throw new Error('Slot already booked');
    await client.query('INSERT INTO viewings(slot_id, buyer_id) VALUES ($1,$2)', [slotId, user.id]);
    await client.query('UPDATE viewing_slots SET is_booked=TRUE WHERE slot_id=$1', [slotId]);
    await client.query('COMMIT');
    return Response.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    return Response.json({ error: e.message }, { status: 409 });
  } finally { client.release(); }
}

export async function GET() {
  const user = await requireRole('buyer');
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await query(
    `SELECT v.viewing_id, v.status, s.slot_start, l.listing_id, l.title
     FROM viewings v JOIN viewing_slots s USING (slot_id) JOIN listings l USING (listing_id)
     WHERE v.buyer_id=$1 ORDER BY s.slot_start`, [user.id]);
  return Response.json(rows);
}
