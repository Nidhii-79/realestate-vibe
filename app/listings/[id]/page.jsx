import { query } from '@/lib/db';
import { inr } from '@/lib/format';
import BookSlots from '@/components/BookSlots';
import SaveButton from '@/components/SaveButton';

export const dynamic = 'force-dynamic';

export default async function ListingPage({ params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return <p>Listing not found.</p>;
  const { rows } = await query(
    `SELECT l.*, n.name AS neighborhood, n.city, u.full_name AS agent_name, a.agency_name
     FROM listings l JOIN neighborhoods n USING (neighborhood_id)
     JOIN agents a USING (agent_id) JOIN users u ON u.user_id = a.user_id
     WHERE l.listing_id = $1`, [id]);
  if (!rows.length) return <p>Listing not found.</p>;
  const l = rows[0];
  const hist = (await query('SELECT old_price, new_price, changed_at FROM price_history WHERE listing_id=$1 ORDER BY changed_at DESC', [id])).rows;

  return (
    <>
      <p><a href="/">← Back to search</a></p>
      <h1>{l.title}</h1>
      <div className="price">{inr(l.price)} <span className="meta">· {l.status}</span></div>
      <p className="meta">{l.bedrooms} bed · {l.bathrooms} bath · {l.area_sqft} sqft · {l.property_type} · {l.neighborhood}, {l.city}</p>
      <div className="panel"><p>{l.description}</p>
        <p className="meta">Listed by {l.agent_name} ({l.agency_name})</p>
        <SaveButton listingId={id} /></div>
      <div className="cols">
        <div className="panel"><h2>Book a viewing</h2><BookSlots listingId={id} /></div>
        <div className="panel"><h2>Price history</h2>
          {hist.length === 0 ? <p className="meta">No price changes yet.</p> : (
            <table><thead><tr><th>When</th><th>From</th><th>To</th></tr></thead><tbody>
              {hist.map((h, i) => (<tr key={i}><td>{new Date(h.changed_at).toLocaleDateString('en-IN')}</td><td>{inr(h.old_price)}</td><td>{inr(h.new_price)}</td></tr>))}
            </tbody></table>)}
        </div>
      </div>
    </>
  );
}
