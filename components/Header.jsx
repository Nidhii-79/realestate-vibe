'use client';
import { useEffect, useState } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then((d) => setUser(d?.user ?? null)).catch(() => {});
  }, []);
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }
  return (
    <header className="top">
      <div className="wrap">
        <a className="brand" href="/">VibeNest</a>
        <nav>
          <a href="/">Search</a>
          {user ? (
            <>
              <a href={`/${user.role}`}>{user.role[0].toUpperCase() + user.role.slice(1)} dashboard</a>
              <span className="meta">{user.name}</span>
              <button className="ghost" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <a href="/login">Log in</a>
              <a href="/register">Register</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
