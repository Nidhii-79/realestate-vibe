import { getUser } from '@/lib/auth';
export async function GET() {
  const u = await getUser();
  if (!u) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user: { id: u.id, name: u.name, role: u.role } });
}
