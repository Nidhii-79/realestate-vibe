'use client';
import { useEffect, useState } from 'react';

export default function SaveButton({ listingId }) {
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState('');
  useEffect(() => {
    fetch('/api/saved').then((r) => (r.ok ? r.json() : [])).then((rows) => setSaved(rows.some((x) => x.listing_id === listingId)));
  }, [listingId]);
  async function toggle() {
    const r = await fetch('/api/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId }) });
    if (!r.ok) return setNote('Log in as a buyer to save listings.');
    setSaved((await r.json()).saved); setNote('');
  }
  return (<div className="row"><button className="ghost" onClick={toggle}>{saved ? 'Saved ✓ (click to remove)' : 'Save for price alerts'}</button>{note && <span className="meta">{note}</span>}</div>);
}
