# VibeNest: Real Estate Listing Recommender with Vibe Search (SQL + Vector)

Search homes the way people actually think about them. Combine hard filters (price, bedrooms, type) with a
natural-language **vibe** like *"quiet family neighborhood near parks"*. Structured data lives in **PostgreSQL**;
listing descriptions and buyer notes are embedded and stored in the same database with **pgvector**, so one
hybrid SQL query filters *and* ranks by semantic similarity.

DBMS Experiential Learning, Level 3 mini project. Team of 2.

## Features
- **Hybrid search**: SQL filters + vector similarity (cosine) ranking, plus GIN full-text search
- **Roles**: buyer, agent, admin (JWT in an httpOnly cookie, enforced in middleware and in every API route)
- **Transaction**: viewing booking with `SELECT ... FOR UPDATE` row lock; double-booking is rolled back
- **Trigger**: any price change writes `price_history` and alerts every buyer who saved the listing
- **Stored procedure**: `sp_record_sale` records a sale atomically
- **Views**: `v_active_listings`, `v_agent_performance`
- **Recommendations**: buyer preference notes are embedded; listings nearest to their average vector are suggested
- **Database-level validation**: CHECK, UNIQUE, FK and NOT NULL constraints reject bad input

## Tech stack
Next.js 14 (Route Handlers as the API layer) · PostgreSQL 16 + pgvector · `pg` (raw SQL) · transformers.js
(all-MiniLM-L6-v2, 384-d) · bcryptjs · jose · Docker · Git/GitHub

## Setup (about 5 minutes)

Prerequisites: Node.js 20+ (22 recommended), Docker Desktop, Git.

```bash
git clone <your-repo-url> && cd realestate-vibe
npm install

# 1. start PostgreSQL with pgvector
docker compose up -d

# 2. configure environment (credentials are never hard-coded)
cp .env.example .env.local        # Windows: copy .env.example .env.local

# 3. create tables, seed demo data, generate embeddings
npm run setup

# 4. run the app
npm run dev                        # http://localhost:3000
```

> The first `npm run setup` downloads the ~25 MB embedding model (needs internet, one time only).
> If the download is blocked, set `EMBED_PROVIDER=hash` in `.env.local` (offline fallback with weaker semantics),
> then run `npm run setup` again.
> **Re-running `npm run setup` resets the database to the demo state.**

### Demo accounts
| Role | Email | Password |
|---|---|---|
| Buyer | buyer@demo.com | buyer123 |
| Buyer | buyer2@demo.com | buyer123 |
| Agent | agent1@demo.com | agent123 |
| Admin | admin@demo.com | admin123 |

## 5-minute demo script
1. **Home**: search *"quiet family neighborhood near parks"*, then add `Max price 20000000` and `Min bedrooms 3` (hybrid query).
2. **Try another vibe**: *"walkable area with good nightlife"*; compare results.
3. Log in as **buyer**: open a listing, **Save for price alerts**, **book a viewing**; add a preference note on the dashboard to see recommendations.
4. Log in as **agent1**: change the price of a listing the buyer saved. The trigger fires.
5. Back as **buyer**: the alert appears. The listing page shows the price history.
6. Try booking the same slot again (or from a second buyer): rejected, transaction rolled back.
7. Agent: record a sale (stored procedure). Admin: view agent performance and the GROUP BY / HAVING report.
8. In `psql`/DBeaver: show the trigger, the HNSW index, and `db/05_sample_queries.sql`.

Open psql inside Docker: `docker exec -it realestate-db psql -U postgres -d realestate`

## Project structure
```
db/            01_schema.sql  02_indexes_views.sql  03_triggers_procedures.sql  04_alter_drop_demo.sql  05_sample_queries.sql
scripts/       init-db.js  seed.js  embed-all.js  smoke-test.mjs
lib/           db.js (pool)  embed.js (embeddings)  auth.js (JWT)  format.js
middleware.js  role-based route protection
app/           pages (search, listing detail, login, register, buyer/agent/admin dashboards)
app/api/       auth, search, listings, viewings, saved, alerts, recommend, agent, admin
components/    Header, ListingCard, BookSlots, SaveButton, AuthForm
docs/          ER_DIAGRAM.md  DATA_DICTIONARY.md  TESTING.md  REPORT_*.md
```

## Requirement mapping (DBMS Level 3 document)
| Requirement | Where |
|---|---|
| SQL + Vector database | PostgreSQL + pgvector (`db/01`, `db/02`) |
| ER diagram, relational schema | `docs/ER_DIAGRAM.md` |
| DDL: CREATE, ALTER, DROP, PK/FK, constraints, indexes, views | `db/01`, `db/02`, `db/04` |
| DML and JOIN/GROUP BY/HAVING/ORDER BY/subquery | `db/05_sample_queries.sql`, API routes |
| 4+ advanced SQL features | transaction, trigger, stored procedure, views, indexing, full-text search |
| Vector similarity search | `app/api/search/route.js`, `app/api/recommend/route.js` |
| Next.js web interface | `app/` |
| API layer, no hard-coded credentials | Route Handlers, `.env.local` |
| Authentication, 2+ roles | `lib/auth.js`, `middleware.js` (buyer, agent, admin) |
| Validation and integrity at DB level | CHECK / UNIQUE / FK constraints, trigger, transactions |
| Documentation, test cases | `docs/`, `scripts/smoke-test.mjs` |

## Why SQL + vector?
Prices, bookings, sales and price history are relational and need ACID guarantees, so they live in PostgreSQL.
Descriptions like "quiet, leafy, close to parks" are subjective and unstructured, so no WHERE clause can express
them; those are embedded and searched by similarity. Using pgvector keeps both in one database, so a single query
combines exact filters with semantic ranking.

## Team contributions
| Member | Area |
|---|---|
| Person A (name, SRN) | Schema, indexes, views, seed data, embedding pipeline, hybrid + full-text search, search UI, listing page, ER diagram, data dictionary |
| Person B (name, SRN) | Auth and roles, booking transaction, trigger and stored procedure, saved listings and alerts, recommendations, buyer/agent/admin dashboards, tests |

Individual commits are visible in the Git history.

## Troubleshooting
- `ECONNREFUSED 5432`: run `docker compose up -d`, wait 10 seconds, retry.
- `extension "vector" is not available`: use the `pgvector/pgvector:pg16` image from `docker-compose.yml`, not plain `postgres`.
- Port 5432 busy: stop local PostgreSQL or change the left side of `5432:5432` and `DATABASE_URL`.
- Model download errors: use `EMBED_PROVIDER=hash` temporarily.
