'use client';
import { useState } from 'react';

export default function AuthForm({ mode }) {
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr('');
    const r = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json();
    if (!r.ok) return setErr(d.error);
    window.location.href = `/${d.user.role}`;
  }
  return (
    <form className="panel" style={{ maxWidth: 420 }} onSubmit={submit}>
      <h1>{mode === 'login' ? 'Log in' : 'Create a buyer account'}</h1>
      {mode === 'register' && <><label>Full name</label><input value={f.name} onChange={set('name')} required /></>}
      <label style={{ marginTop: '.6rem' }}>Email</label><input type="email" value={f.email} onChange={set('email')} required />
      <label style={{ marginTop: '.6rem' }}>Password</label><input type="password" value={f.password} onChange={set('password')} required />
      {err && <div className="msg err">{err}</div>}
      <div style={{ marginTop: '.9rem' }}><button>{mode === 'login' ? 'Log in' : 'Register'}</button></div>
      {mode === 'login' && <p className="meta">Demo: buyer@demo.com / buyer123 · agent1@demo.com / agent123 · admin@demo.com / admin123</p>}
    </form>
  );
}
