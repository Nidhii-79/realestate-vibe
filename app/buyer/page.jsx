'use client';
import { useEffect, useState } from 'react';
import ListingCard from '@/components/ListingCard';

export default function BuyerDashboard() {
  const [saved, setSaved] = useState([]), [views, setViews] = useState([]), [alerts, setAlerts] = useState([]), [rec, setRec] = useState([]);
  const [note, setNote] = useState(''), [msg, setMsg] = useState('');
  const load = async () => {
    setSaved(await (await fetch('/api/saved')).json());
    setViews(await (await fetch('/api/viewings')).json());
    setAlerts(await (await fetch('/api/alerts')).json());
    setRec(await (await fetch('/api/recommend')).json());
  };
  useEffect(() => { load(); }, []);

  async function addNote(e) {
    e.preventDefault();
    const r = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note }) });
    setMsg(r.ok ? 'Preference saved' : (await r.json()).error); setNote(''); load();
  }
  async function markRead() { await fetch('/api/alerts', { method: 'PATCH' }); load(); }
  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <>
      <h1>Buyer dashboard</h1>
      <div className="cols">
        <section className="panel"><div className="row"><h2 style={{ marginRight: 'auto' }}>Price alerts {unread > 0 && `(${unread} new)`}</h2>
          {unread > 0 && <button className="ghost" onClick={markRead}>Mark read</button>}</div>
          {alerts.length === 0 ? <p className="meta">No alerts. Save a listing and ask your agent to change its price.</p> :
            alerts.map((a) => <p key={a.alert_id} style={{ fontWeight: a.is_read ? 400 : 700 }}><a href={`/listings/${a.listing_id}`}>{a.message}</a></p>)}
        </section>
        <section className="panel"><h2>My viewings</h2>
          {views.length === 0 ? <p className="meta">No viewings booked yet.</p> :
            <table><tbody>{views.map((v) => <tr key={v.viewing_id}><td><a href={`/listings/${v.listing_id}`}>{v.title}</a></td><td>{new Date(v.slot_start).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{v.status}</td></tr>)}</tbody></table>}
        </section>
      </div>
      <section className="panel"><h2>Tell us what you like</h2>
        <form onSubmit={addNote} className="row"><input style={{ flex: 1 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. I want a calm place with greenery where my dog can run" />
          <button>Save preference</button></form>
        {msg && <div className="msg ok">{msg}</div>}
        <h3 style={{ marginTop: '1rem' }}>Recommended for you</h3>
        {rec.length === 0 ? <p className="meta">Save a preference note to get vector-based recommendations.</p> :
          <div className="grid">{rec.map((l) => <ListingCard key={l.listing_id} l={l} />)}</div>}
      </section>
      <section className="panel"><h2>Saved listings</h2>
        {saved.length === 0 ? <p className="meta">Nothing saved yet.</p> : <div className="grid">{saved.map((l) => <ListingCard key={l.listing_id} l={l} />)}</div>}
      </section>
    </>
  );
}
