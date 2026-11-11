// Seeds demo users, agents, neighborhoods, listings, viewing slots and saved listings.
import bcrypt from 'bcryptjs';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const q = (t, p) => client.query(t, p);

const hash = (pw) => bcrypt.hashSync(pw, 10);
const users = [
  ['Admin User', 'admin@demo.com', 'admin123', 'admin'],
  ['Priya Raman', 'agent1@demo.com', 'agent123', 'agent'],
  ['Karthik Iyer', 'agent2@demo.com', 'agent123', 'agent'],
  ['Sanjana Buyer', 'buyer@demo.com', 'buyer123', 'buyer'],
  ['Rahul Buyer', 'buyer2@demo.com', 'buyer123', 'buyer'],
];
const ids = {};
for (const [name, email, pw, role] of users) {
  const r = await q('INSERT INTO users(full_name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING user_id', [name, email, hash(pw), role]);
  ids[email] = r.rows[0].user_id;
}
const a1 = (await q('INSERT INTO agents(user_id,license_no,agency_name,phone) VALUES ($1,$2,$3,$4) RETURNING agent_id', [ids['agent1@demo.com'], 'TN-RE-1001', 'Coastline Realty', '9840000001'])).rows[0].agent_id;
const a2 = (await q('INSERT INTO agents(user_id,license_no,agency_name,phone) VALUES ($1,$2,$3,$4) RETURNING agent_id', [ids['agent2@demo.com'], 'TN-RE-1002', 'Urban Nest', '9840000002'])).rows[0].agent_id;
const agents = [a1, a2];

const hoods = ['Adyar', 'Besant Nagar', 'Anna Nagar', 'T. Nagar', 'Velachery', 'Sholinganallur'];
const hid = [];
for (const h of hoods) hid.push((await q('INSERT INTO neighborhoods(name,city) VALUES ($1,$2) RETURNING neighborhood_id', [h, 'Chennai'])).rows[0].neighborhood_id);

// [title, description, type, price, beds, baths, sqft, hoodIdx]
const L = [
  ['Leafy 3BHK near Adyar Park', 'Quiet tree-lined street with a large public park two minutes away. Ideal for families with kids, safe cycling lanes, a school nearby and a calm evening atmosphere.', 'apartment', 14500000, 3, 3, 1650, 0],
  ['Sunlit 2BHK by the Beach', 'Walk to the beach in five minutes. Sea breeze, balcony with ocean views, cafes and a relaxed seaside vibe. Great for remote workers who love sunrise walks.', 'apartment', 11800000, 2, 2, 1100, 1],
  ['Heritage Villa with Garden', 'Spacious independent villa with a mango garden, wide verandah and old-world charm. Peaceful, private and perfect for large joint families who value greenery.', 'villa', 38000000, 5, 5, 4200, 0],
  ['Compact Studio near Nightlife', 'Walkable area with restaurants, pubs and live music within minutes. Ideal for young professionals who want a lively social scene and easy auto access.', 'apartment', 5200000, 1, 1, 520, 3],
  ['Family Home near Schools and Parks', 'Quiet family neighborhood with three reputed schools, a children play park and a weekend farmers market nearby. Very safe, friendly community.', 'house', 17500000, 4, 3, 2400, 2],
  ['Tech Corridor 2BHK with Gym', 'Ten minutes from the IT corridor with a gym, pool and co-working lounge in the society. Modern amenities, fast internet and quick metro access.', 'apartment', 8200000, 2, 2, 1180, 5],
  ['Budget 1BHK for First-time Buyers', 'Affordable starter flat close to the bus depot and a market. Simple, practical and well connected, with a supermarket downstairs.', 'apartment', 3600000, 1, 1, 640, 4],
  ['Luxury Sea-facing Penthouse', 'Top floor penthouse with a private terrace, panoramic sea views, concierge service and a rooftop infinity pool. Premium living for those who love luxury.', 'apartment', 52000000, 4, 4, 3600, 1],
  ['Peaceful Retreat for Retirees', 'Ground floor 2BHK in a silent gated community with a temple, a walking track and a small clinic inside the campus. Calm and low traffic.', 'apartment', 9400000, 2, 2, 1250, 2],
  ['Pet-friendly Garden Apartment', 'Ground floor with a private garden, dog park next door and pet-friendly neighbors. Quiet lanes for evening walks and lots of green space.', 'apartment', 10900000, 3, 2, 1450, 4],
  ['Shopping Street Duplex', 'Duplex right in the busiest shopping district. Noisy and energetic, with fashion stores, street food and everything within walking distance. Great rental income potential.', 'house', 21000000, 3, 3, 2000, 3],
  ['Lakeside Villa with Bird Watching', 'Villa overlooking a quiet lake frequented by migratory birds. Serene mornings, yoga deck and a naturally cool microclimate. Nature lovers will adore it.', 'villa', 29500000, 4, 4, 3300, 5],
  ['Metro-adjacent 2BHK', 'Two minutes from the metro station. Perfect for daily commuters who want to skip traffic, with a bakery and pharmacy at the gate.', 'apartment', 7600000, 2, 2, 1050, 4],
  ['Artist Loft with High Ceilings', 'Double-height loft with big windows, exposed brick and a creative neighborhood full of galleries, bookstores and indie cafes. Inspiring and bohemian.', 'apartment', 9800000, 1, 2, 900, 0],
  ['Gated Community Villa with Clubhouse', 'Secure gated township with a clubhouse, tennis court, kids play area and 24x7 security. Community events every weekend, perfect for families.', 'villa', 24500000, 4, 4, 3000, 5],
  ['Corner Plot Near Highway', 'East-facing corner plot with easy highway access, suitable for building a custom home or small commercial space. Clear title and DTCP approved.', 'plot', 6800000, 0, 0, 2400, 5],
  ['Quiet Courtyard Home', 'Traditional courtyard house with a tulsi garden, thick walls that keep it cool and complete silence at night. Tucked in a lane away from traffic.', 'house', 16200000, 3, 2, 1900, 0],
  ['Co-living Friendly 3BHK', 'Large three bedroom flat with separate entrances, great for roommates. Close to colleges, cheap eateries and late night food joints.', 'apartment', 9100000, 3, 3, 1500, 4],
  ['Walkable Cafe District Flat', 'Step outside to cafes, bakeries, a bookshop and a weekend art market. Walkable, social and full of life without being too loud.', 'apartment', 12300000, 2, 2, 1120, 1],
  ['Green Terrace Apartment', 'Spacious terrace garden with herbs and flowering plants, shaded by neem trees. Quiet, airy, great for gardening enthusiasts and families.', 'apartment', 13200000, 3, 3, 1580, 2],
  ['Smart Home 2BHK with Home Office', 'Fully automated apartment with a dedicated home office room, sound insulation and fiber broadband. Built for people working from home.', 'apartment', 8900000, 2, 2, 1130, 5],
  ['Old-town Row House', 'Classic row house in an established neighborhood with friendly neighbors, a temple at the corner and daily vegetable vendors. Close-knit and traditional.', 'house', 12800000, 3, 2, 1700, 3],
  ['Beachfront Cottage', 'Small cottage steps from the sand with a wooden deck, hammock and the sound of waves all night. A laid-back getaway or permanent beach life.', 'house', 19800000, 2, 2, 1300, 1],
  ['Investor Special 1BHK near IT Park', 'High rental yield one bedroom close to major IT parks, always in demand by young tech professionals. Low maintenance and easy to lease.', 'apartment', 5600000, 1, 1, 590, 5],
];
for (let i = 0; i < L.length; i++) {
  const [t, d, ty, p, b, ba, a, h] = L[i];
  const r = await q(
    'INSERT INTO listings(agent_id,neighborhood_id,title,description,property_type,price,bedrooms,bathrooms,area_sqft) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING listing_id',
    [agents[i % 2], hid[h], t, d, ty, p, b, ba, a]);
  const lid = r.rows[0].listing_id;
  for (let day = 1; day <= 3; day++) {
    await q("INSERT INTO viewing_slots(listing_id, slot_start) VALUES ($1, date_trunc('day', now()) + ($2 || ' days')::interval + interval '10 hours')", [lid, String(day)]);
  }
}
for (const lid of [1, 2, 3]) await q('INSERT INTO saved_listings VALUES ($1,$2)', [ids['buyer@demo.com'], lid]);
console.log('seeded', users.length, 'users,', L.length, 'listings');
await client.end();
