import { query } from '@/lib/db';
import { embed } from '@/lib/embed';
import { requireRole } from '@/lib/auth';

// POST {note}: store a buyer preference note with its embedding
export async function POST(req) {
  const u = await requireRole('buyer');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { note } = await req.json();
  if (!note?.trim()) return Response.json({ error: 'Write a preference note first' }, { status: 400 });
  await query('INSERT INTO buyer_preferences(buyer_id, note_text, embedding) VALUES ($1,$2,$3::vector)', [u.id, note, await embed(note)]);
  return Response.json({ ok: true });
}

// GET: recommend active listings closest to the AVERAGE of the buyer's preference embeddings
export async function GET() {
  const u = await requireRole('buyer');
  if (!u) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await query(
    `WITH p AS (SELECT avg(embedding) AS v FROM buyer_preferences WHERE buyer_id=$1)
     SELECT l.listing_id, l.title, l.price, l.bedrooms, n.name AS neighborhood,
            ROUND((1 - (e.embedding <=> p.v))::numeric, 3) AS similarity
     FROM p, listings l JOIN listing_embeddings e USING (listing_id) JOIN neighborhoods n USING (neighborhood_id)
     WHERE p.v IS NOT NULL AND l.status='active'
     ORDER BY e.embedding <=> p.v LIMIT 5`, [u.id]);
  return Response.json(rows);
}
