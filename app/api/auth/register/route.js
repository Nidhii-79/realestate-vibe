import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password || password.length < 6)
    return Response.json({ error: 'Name, email and a password of 6+ characters are required' }, { status: 400 });
  try {
    const { rows } = await query(
      "INSERT INTO users(full_name,email,password_hash,role) VALUES ($1,$2,$3,'buyer') RETURNING user_id, full_name, role",
      [name, email.toLowerCase(), await bcrypt.hash(password, 10)]);
    const u = rows[0];
    cookies().set('token', await signToken({ id: u.user_id, name: u.full_name, role: u.role }),
      { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7200 });
    return Response.json({ user: { id: u.user_id, name: u.full_name, role: u.role } });
  } catch (e) {
    const msg = e.code === '23505' ? 'That email is already registered' : 'Invalid details: ' + e.message;
    return Response.json({ error: msg }, { status: 400 });
  }
}
