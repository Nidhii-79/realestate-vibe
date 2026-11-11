import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Route prefix -> required role
const RULES = [
  ['/admin', 'admin'], ['/api/admin', 'admin'],
  ['/agent', 'agent'], ['/api/agent', 'agent'],
  ['/buyer', 'buyer'], ['/api/viewings', 'buyer'], ['/api/saved', 'buyer'],
  ['/api/alerts', 'buyer'], ['/api/recommend', 'buyer'],
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const rule = RULES.find(([p]) => pathname === p || pathname.startsWith(p + '/'));
  if (!rule) return NextResponse.next();
  const isApi = pathname.startsWith('/api');
  const deny = (status, msg) => isApi
    ? NextResponse.json({ error: msg }, { status })
    : NextResponse.redirect(new URL('/login', req.url));

  const token = req.cookies.get('token')?.value;
  if (!token) return deny(401, 'Please log in');
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    if (payload.role !== rule[1]) return deny(403, 'Forbidden for your role');
  } catch { return deny(401, 'Session expired'); }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/agent/:path*', '/api/agent/:path*', '/buyer/:path*',
    '/api/viewings/:path*', '/api/saved/:path*', '/api/alerts/:path*', '/api/recommend/:path*'],
};
