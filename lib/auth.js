import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export const signToken = (payload) =>
  new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('2h').sign(secret());

export async function verifyToken(token) {
  try { return (await jwtVerify(token, secret())).payload; } catch { return null; }
}

// Current logged-in user {id, name, role} or null (reads httpOnly cookie)
export async function getUser() {
  const t = cookies().get('token')?.value;
  return t ? verifyToken(t) : null;
}

// Role guard for route handlers (defence in depth on top of middleware)
export async function requireRole(role) {
  const u = await getUser();
  if (!u || u.role !== role) return null;
  return u;
}
