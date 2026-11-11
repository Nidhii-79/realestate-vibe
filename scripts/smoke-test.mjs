// End-to-end smoke test. Run the app first (npm run dev), then: npm run smoke
const BASE = process.env.BASE_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${cond ? '' : extra}`); };

async function login(email, password) {
  const r = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  return { status: r.status, cookie: (r.headers.get('set-cookie') || '').split(';')[0] };
}
const call = (cookie, path, method = 'GET', body) =>
  fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', cookie: cookie || '' }, body: body ? JSON.stringify(body) : undefined });

const bad = await login('buyer@demo.com', 'wrong');
ok('T1 wrong password rejected', bad.status === 401);
const buyer = await login('buyer@demo.com', 'buyer123');
const agent = await login('agent1@demo.com', 'agent123');
const admin = await login('admin@demo.com', 'admin123');
ok('T2 login works for buyer/agent/admin', buyer.cookie && agent.cookie && admin.cookie);

const dup = await call('', '/api/auth/register', 'POST', { name: 'X', email: 'buyer@demo.com', password: 'abcdef' });
ok('T3 duplicate email rejected (UNIQUE)', dup.status === 400);

ok('T4 buyer blocked from admin API (403)', (await call(buyer.cookie, '/api/admin/stats')).status === 403);
ok('T5 anonymous blocked from buyer API (401)', (await call('', '/api/saved')).status === 401);
ok('T6 admin can read stats', (await call(admin.cookie, '/api/admin/stats')).status === 200);

const s = await (await call('', '/api/search', 'POST', { vibe: 'quiet family neighborhood near parks' })).json();
ok('T7 vibe search returns ranked results', Array.isArray(s) && s.length > 0 && s[0].similarity >= s[s.length - 1].similarity, JSON.stringify(s).slice(0, 120));
const f = await (await call('', '/api/search', 'POST', { vibe: 'quiet family neighborhood near parks', maxPrice: 10000000, minBeds: 2 })).json();
ok('T8 hybrid filters respected', f.every((r) => Number(r.price) <= 10000000 && r.bedrooms >= 2));

const slots = await (await call('', '/api/listings/4/slots')).json();
const free = slots.find((x) => !x.is_booked);
const b1 = await call(buyer.cookie, '/api/viewings', 'POST', { slotId: free.slot_id });
const b2 = await call(buyer.cookie, '/api/viewings', 'POST', { slotId: free.slot_id });
ok('T9 booking succeeds then double-booking is rolled back (409)', b1.status === 200 && b2.status === 409);

await call(buyer.cookie, '/api/saved', 'POST', { listingId: 5 }); // ensure saved (toggle may unsave)
const saved = await (await call(buyer.cookie, '/api/saved')).json();
if (!saved.some((x) => x.listing_id === 5)) await call(buyer.cookie, '/api/saved', 'POST', { listingId: 5 });
const before = (await (await call(buyer.cookie, '/api/alerts')).json()).length;
const mine = await (await call(agent.cookie, '/api/agent/listings')).json();
const target = mine.listings.find((l) => l.listing_id === 5) || mine.listings[0];
await call(buyer.cookie, '/api/saved', 'POST', { listingId: target.listing_id });
const sv = await (await call(buyer.cookie, '/api/saved')).json();
if (!sv.some((x) => x.listing_id === target.listing_id)) await call(buyer.cookie, '/api/saved', 'POST', { listingId: target.listing_id });
const pr = await call(agent.cookie, '/api/agent/listings', 'PATCH', { listingId: target.listing_id, price: Number(target.price) - 50000 });
const after = (await (await call(buyer.cookie, '/api/alerts')).json()).length;
ok('T10 price update fires trigger -> new alert', pr.status === 200 && after === before + 1, `before=${before} after=${after}`);

const neg = await call(agent.cookie, '/api/agent/listings', 'PATCH', { listingId: target.listing_id, price: -5 });
ok('T11 negative price rejected by DB CHECK', neg.status === 400);

const created = await call(agent.cookie, '/api/agent/listings', 'POST', { title: 'Test Villa', description: 'Peaceful villa with garden', propertyType: 'villa', price: 9000000, bedrooms: 3, bathrooms: 2, neighborhoodId: 1 });
ok('T12 agent creates listing (+embedding +slots)', created.status === 200);
const badType = await call(agent.cookie, '/api/agent/listings', 'POST', { title: 'Bad', description: 'x', propertyType: 'castle', price: 1, bedrooms: 1, bathrooms: 1, neighborhoodId: 1 });
ok('T13 invalid property_type rejected by DB CHECK', badType.status === 400);
ok('T14 buyer cannot use agent API (403)', (await call(buyer.cookie, '/api/agent/listings')).status === 403);

const ft = await (await call('', '/api/search/text?q=garden')).json();
ok('T15 full-text search works', ft.length > 0);
const rec = await call(buyer.cookie, '/api/recommend', 'POST', { note: 'calm place with greenery for my dog' });
const recs = await (await call(buyer.cookie, '/api/recommend')).json();
ok('T16 preference note embedded + recommendations', rec.status === 200 && recs.length > 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
