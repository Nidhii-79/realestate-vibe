import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const u = await requireRole('buyer');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await query('SELECT alert_id, listing_id, message, is_read, created_at FROM alerts WHERE buyer_id=$1 ORDER BY created_at DESC LIMIT 20', [u.id]);
  return Response.json(rows);
}

// PATCH marks all alerts read
export async function PATCH() {
  const u = await requireRole('buyer');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  await query('UPDATE alerts SET is_read=TRUE WHERE buyer_id=$1', [u.id]);
  return Response.json({ ok: true });
}
