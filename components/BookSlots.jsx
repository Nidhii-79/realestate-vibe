'use client';
import { useEffect, useState } from 'react';

export default function BookSlots({ listingId }) {
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState(null);
  const load = () => fetch(`/api/listings/${listingId}/slots`).then((r) => r.json()).then(setSlots);
  useEffect(() => { load(); }, [listingId]);

  async function book(slotId) {
    const r = await fetch('/api/viewings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slotId }) });
    const d = await r.json();
    setMsg(r.ok ? { ok: true, t: 'Viewing booked. See it on your buyer dashboard.' }
                : { ok: false, t: r.status === 401 || r.status === 403 ? 'Log in as a buyer to book a viewing.' : d.error });
    load();
  }
  return (
    <>
      {slots.length === 0 && <p className="meta">No upcoming slots.</p>}
      {slots.map((s) => (
        <button key={s.slot_id} className={s.is_booked ? 'ghost slot' : 'slot'} disabled={s.is_booked} onClick={() => book(s.slot_id)}>
          {new Date(s.slot_start).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}{s.is_booked ? ' (taken)' : ''}
        </button>
      ))}
      {msg && <div className={`msg ${msg.ok ? 'ok' : 'err'}`}>{msg.t}</div>}
    </>
  );
}
