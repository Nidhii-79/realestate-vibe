'use client';
import { useEffect, useState } from 'react';
import { inr } from '@/lib/format';

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { fetch('/api/admin/stats').then((r) => r.json()).then(setS); }, []);
  if (!s) return <p>Loading…</p>;
  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="cols">
        <section className="panel"><h2>Users by role</h2>
          <table><tbody>{s.users.map((u) => <tr key={u.role}><td>{u.role}</td><td>{u.count}</td></tr>)}</tbody></table>
          <h2 style={{ marginTop: '1rem' }}>Listings by status</h2>
          <table><tbody>{s.status.map((u) => <tr key={u.status}><td>{u.status}</td><td>{u.count}</td></tr>)}</tbody></table></section>
        <section className="panel"><h2>Agent performance <span className="meta">(view v_agent_performance)</span></h2>
          <table><thead><tr><th>Agent</th><th>Listings</th><th>Sold</th><th>Revenue</th></tr></thead>
            <tbody>{s.agents.map((a) => <tr key={a.agent_id}><td>{a.full_name}</td><td>{a.total_listings}</td><td>{a.sold}</td><td>{inr(a.revenue)}</td></tr>)}</tbody></table></section>
      </div>
      <section className="panel"><h2>Neighborhoods priced above the market average <span className="meta">(GROUP BY + HAVING + subquery)</span></h2>
        <table><thead><tr><th>Neighborhood</th><th>Listings</th><th>Average price</th></tr></thead>
          <tbody>{s.hoods.map((h) => <tr key={h.name}><td>{h.name}</td><td>{h.listings}</td><td>{inr(h.avg_price)}</td></tr>)}</tbody></table></section>
      <section className="panel"><h2>Recent price changes <span className="meta">(written by trigger)</span></h2>
        {s.prices.length === 0 ? <p className="meta">No price changes yet.</p> :
          <table><thead><tr><th>When</th><th>Listing</th><th>From</th><th>To</th></tr></thead>
            <tbody>{s.prices.map((p, i) => <tr key={i}><td>{new Date(p.changed_at).toLocaleString('en-IN')}</td><td>{p.title}</td><td>{inr(p.old_price)}</td><td>{inr(p.new_price)}</td></tr>)}</tbody></table>}</section>
    </>
  );
}
