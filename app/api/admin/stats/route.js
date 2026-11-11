import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const u = await requireRole('admin');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const agents = (await query('SELECT * FROM v_agent_performance ORDER BY revenue DESC')).rows;
  // GROUP BY + HAVING + subquery
  const hoods = (await query(
    `SELECT n.name, COUNT(*)::int AS listings, ROUND(AVG(l.price)) AS avg_price
     FROM listings l JOIN neighborhoods n USING (neighborhood_id)
     GROUP BY n.name HAVING AVG(l.price) > (SELECT AVG(price) FROM listings)
     ORDER BY avg_price DESC`)).rows;
  const users = (await query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role ORDER BY role')).rows;
  const prices = (await query(
    `SELECT h.changed_at, l.title, h.old_price, h.new_price FROM price_history h JOIN listings l USING (listing_id)
     ORDER BY h.changed_at DESC LIMIT 10`)).rows;
  const status = (await query('SELECT status, COUNT(*)::int AS count FROM listings GROUP BY status')).rows;
  return Response.json({ agents, hoods, users, prices, status });
}
