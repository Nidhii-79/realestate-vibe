'use client';
import { useEffect, useState } from 'react';
import ListingCard from '@/components/ListingCard';

export default function Home() {
  const [vibe, setVibe] = useState('');
  const [f, setF] = useState({ minPrice: '', maxPrice: '', minBeds: '', type: '' });
  const [rows, setRows] = useState([]);
  const [mode, setMode] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function browse() {
    const r = await fetch('/api/listings');
    setRows(await r.json()); setMode('browse');
  }
  useEffect(() => { browse(); }, []);

  async function search(e) {
    e.preventDefault();
    if (!vibe.trim()) return browse();
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe, ...f }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Search failed');
      setRows(d); setMode('vibe');
    } catch (e2) { setErr(e2.message); } finally { setLoading(false); }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <h1>Describe the place you want to live in.</h1>
      <p className="meta">Combine hard filters with a feeling. The vibe is matched semantically, not by keywords.</p>
      <form className="panel" onSubmit={search}>
        <label htmlFor="vibe">Your vibe</label>
        <textarea id="vibe" rows={2} value={vibe} onChange={(e) => setVibe(e.target.value)}
          placeholder="quiet family neighborhood near parks" />
        <div className="filters">
          <div><label>Min price (₹)</label><input type="number" value={f.minPrice} onChange={set('minPrice')} /></div>
          <div><label>Max price (₹)</label><input type="number" value={f.maxPrice} onChange={set('maxPrice')} /></div>
          <div><label>Min bedrooms</label><input type="number" min="0" value={f.minBeds} onChange={set('minBeds')} /></div>
          <div><label>Type</label>
            <select value={f.type} onChange={set('type')}>
              <option value="">Any</option><option>apartment</option><option>villa</option><option>house</option><option>plot</option>
            </select></div>
        </div>
        <div className="row" style={{ marginTop: '.75rem' }}>
          <button disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
          <button type="button" className="ghost" onClick={() => { setVibe(''); setF({ minPrice: '', maxPrice: '', minBeds: '', type: '' }); browse(); }}>Reset</button>
        </div>
      </form>
      {err && <div className="msg err">{err}</div>}
      <h2>{mode === 'vibe' ? `Best matches (${rows.length})` : `All active listings (${rows.length})`}</h2>
      {rows.length === 0 && <p className="meta">No listings match. Loosen a filter or reword your vibe.</p>}
      <div className="grid">{rows.map((l) => <ListingCard key={l.listing_id} l={l} />)}</div>
    </>
  );
}
