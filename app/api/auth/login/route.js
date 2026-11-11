import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  const { rows } = await query('SELECT user_id, full_name, role, password_hash FROM users WHERE email=$1', [String(email || '').toLowerCase()]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
    return Response.json({ error: 'Wrong email or password' }, { status: 401 });
  cookies().set('token', await signToken({ id: u.user_id, name: u.full_name, role: u.role }),
    { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7200 });
  return Response.json({ user: { id: u.user_id, name: u.full_name, role: u.role } });
}
