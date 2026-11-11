import { query } from '@/lib/db';
export async function GET(_req, { params }) {
  const { rows } = await query(
    'SELECT slot_id, slot_start, is_booked FROM viewing_slots WHERE listing_id=$1 AND slot_start > now() ORDER BY slot_start', [params.id]);
  return Response.json(rows);
}
