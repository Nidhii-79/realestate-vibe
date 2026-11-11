'use client';
import { useEffect, useState } from 'react';
import { inr } from '@/lib/format';

const blank = { title: '', description: '', propertyType: 'apartment', price: '', bedrooms: 2, bathrooms: 2, areaSqft: '', neighborhoodId: '' };

export default function AgentDashboard() {
  const [data, setData] = useState({ listings: [], neighborhoods: [] });
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState(null);
  const [newPrice, setNewPrice] = useState({});
  const [sale, setSale] = useState({});
  const load = async () => setData(await (await fetch('/api/agent/listings')).json());
  useEffect(() => { load(); }, []);
  const say = (ok, t) => setMsg({ ok, t });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const post = (url, method, body) => fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  async function create(e) {
    e.preventDefault();
    const r = await post('/api/agent/listings', 'POST', { ...f, neighborhoodId: f.neighborhoodId || data.neighborhoods[0]?.neighborhood_id });
    const d = await r.json();
    if (r.ok) { say(true, `Listing #${d.listing_id} created and embedded for vibe search.`); setF(blank); load(); } else say(false, d.error);
  }
  async function changePrice(id) {
    const r = await post('/api/agent/listings', 'PATCH', { listingId: id, price: newPrice[id] });
    const d = await r.json();
    if (r.ok) { say(true, 'Price updated. Trigger logged history and alerted buyers who saved it.'); load(); } else say(false, d.error);
  }
  async function sell(id) {
    const s = sale[id] || {};
    const r = await post('/api/agent/sell', 'POST', { listingId: id, buyerEmail: s.email, price: s.price });
    const d = await r.json();
    if (r.ok) { say(true, 'Sale recorded via stored procedure.'); load(); } else say(false, d.error);
  }

  return (
    <>
      <h1>Agent dashboard</h1>
      {msg && <div className={`msg ${msg.ok ? 'ok' : 'err'}`}>{msg.t}</div>}
      <section className="panel"><h2>My listings</h2>
        <div style={{ overflowX: 'auto' }}><table>
          <thead><tr><th>Title</th><th>Price</th><th>Status</th><th>Change price</th><th>Record sale (buyer email, price)</th></tr></thead>
          <tbody>{data.listings.map((l) => (
            <tr key={l.listing_id}>
              <td><a href={`/listings/${l.listing_id}`}>{l.title}</a></td><td>{inr(l.price)}</td><td>{l.status}</td>
              <td><div className="row"><input style={{ width: 110 }} type="number" placeholder="new price" onChange={(e) => setNewPrice({ ...newPrice, [l.listing_id]: e.target.value })} />
                <button className="ghost" onClick={() => changePrice(l.listing_id)}>Update</button></div></td>
              <td>{l.status === 'active' && <div className="row"><input style={{ width: 150 }} placeholder="buyer@demo.com" onChange={(e) => setSale({ ...sale, [l.listing_id]: { ...sale[l.listing_id], email: e.target.value } })} />
                <input style={{ width: 100 }} type="number" placeholder="price" onChange={(e) => setSale({ ...sale, [l.listing_id]: { ...sale[l.listing_id], price: e.target.value } })} />
                <button className="ghost" onClick={() => sell(l.listing_id)}>Sell</button></div>}</td>
            </tr>))}</tbody></table></div>
      </section>
      <section className="panel"><h2>Add a listing</h2>
        <form onSubmit={create}>
          <label>Title</label><input value={f.title} onChange={set('title')} required />
          <label style={{ marginTop: '.6rem' }}>Description (this text becomes the listing&apos;s vibe vector)</label>
          <textarea rows={3} value={f.description} onChange={set('description')} required />
          <div className="filters">
            <div><label>Type</label><select value={f.propertyType} onChange={set('propertyType')}><option>apartment</option><option>villa</option><option>house</option><option>plot</option></select></div>
            <div><label>Neighborhood</label><select value={f.neighborhoodId} onChange={set('neighborhoodId')}>{data.neighborhoods.map((n) => <option key={n.neighborhood_id} value={n.neighborhood_id}>{n.name}</option>)}</select></div>
            <div><label>Price (₹)</label><input type="number" value={f.price} onChange={set('price')} required /></div>
            <div><label>Bedrooms</label><input type="number" value={f.bedrooms} onChange={set('bedrooms')} /></div>
            <div><label>Bathrooms</label><input type="number" value={f.bathrooms} onChange={set('bathrooms')} /></div>
            <div><label>Area (sqft)</label><input type="number" value={f.areaSqft} onChange={set('areaSqft')} /></div>
          </div>
          <div style={{ marginTop: '.75rem' }}><button>Create listing</button></div>
        </form>
      </section>
    </>
  );
}
