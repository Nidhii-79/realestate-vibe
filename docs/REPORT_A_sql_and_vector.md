# Report sections owned by Person A
Copy into the final report (follow the order in the guidelines PDF). Fill the SRN/name placeholders.

## 1. Title
Real Estate Listing Recommender with Vibe Search (SQL + Vector)

## 2. Student SRN and Name
| SRN | Name |
|---|---|
| PES__________ | ________________ (Person A) |
| PES__________ | ________________ (Person B) |

## 3. Abstract
VibeNest is a property listing platform. Structured data (users, agents, listings, viewings, sales, price history)
lives in PostgreSQL. Listing descriptions and buyer preference notes are converted to 384-dimensional embeddings
and stored in the same database using pgvector. Buyers combine hard filters (price, bedrooms, type) with a
natural-language "vibe" such as "quiet family neighborhood near parks"; one hybrid SQL query filters with WHERE
and ranks by cosine similarity. The app has role-based access for buyers, agents and admins, a transactional
viewing-booking flow, a trigger that logs price changes and alerts interested buyers, and a stored procedure that
records sales atomically.

## 4. Tech Stack
Next.js 14 (React 18, Route Handlers), Node.js 22, PostgreSQL 16 + pgvector, `pg` driver (raw SQL),
transformers.js (all-MiniLM-L6-v2 sentence embeddings), bcryptjs, jose (JWT), Docker, Git/GitHub.

## 5. SQL Database Commands
Scripts: `db/01_schema.sql` (CREATE TABLE, PK, FK, CHECK, UNIQUE), `db/02_indexes_views.sql`,
`db/03_triggers_procedures.sql`, `db/04_alter_drop_demo.sql`, `db/05_sample_queries.sql`.
Paste key excerpts as code blocks: CREATE TABLE listings, the indexes, both views, the trigger, the procedure,
and 3 sample queries.

## 6. NoSQL / Vector Database Commands (pgvector)

| Command | What it does in this project |
|---|---|
| `CREATE EXTENSION vector;` | Enables the pgvector extension in PostgreSQL |
| `embedding vector(384)` | Column storing one 384-d sentence embedding per listing or preference note |
| `CREATE INDEX idx_listing_emb ON listing_embeddings USING hnsw (embedding vector_cosine_ops);` | Approximate nearest-neighbour index for fast cosine search |
| `INSERT INTO listing_embeddings(listing_id, embedding) VALUES ($1, $2::vector);` | Stores the embedding generated from title + description |
| `... ORDER BY e.embedding <=> $1::vector LIMIT 10` | Returns the 10 listings closest in meaning (cosine distance) |
| `1 - (e.embedding <=> $1::vector) AS similarity` | Converts distance to a 0-1 score shown as "% vibe match" |
| `SELECT avg(embedding) FROM buyer_preferences WHERE buyer_id=$1` | Averages a buyer's preference vectors to recommend listings |

**Embedding explanation (required by the project document)**
- *What is embedded:* listing title + description, and buyer preference notes.
- *Model:* all-MiniLM-L6-v2 (sentence-transformers), 384 dimensions, normalized, run locally via transformers.js.
- *Storage:* pgvector `vector(384)` columns in PostgreSQL.
- *Similarity metric:* cosine distance (`<=>`).
- *Retrieval:* the query text is embedded with the same model, SQL filters narrow candidates, results are ordered by distance (HNSW index).
- *Why a vector DB:* phrases like "quiet" or "walkable nightlife" are subjective and unstructured, so no WHERE clause can express them. Prices, bookings and sales are relational and need ACID guarantees.
