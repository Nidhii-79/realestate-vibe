# Testing

Automated: start the app (`npm run dev`), then in another terminal run `npm run smoke`.
Expected: `16 passed, 0 failed`. The smoke test changes data slightly; run `npm run setup` to reset.

| ID | Test case | Expected | Verifies |
|---|---|---|---|
| T1 | Login with wrong password | 401 | Authentication |
| T2 | Login as buyer, agent, admin | Success, cookie set | Authentication |
| T3 | Register an existing email | 400 | UNIQUE constraint |
| T4 | Buyer calls admin API | 403 | Role-based authorization |
| T5 | Anonymous calls buyer API | 401 | Route protection |
| T6 | Admin reads stats | 200 | Admin role, view and HAVING query |
| T7 | Vibe search "quiet family neighborhood near parks" | Ranked list, similarity descending | Vector search |
| T8 | Same search with max price and min bedrooms | All rows satisfy filters | Hybrid SQL + vector query |
| T9 | Book a slot twice | 1st OK, 2nd 409 | Transaction + row lock + rollback |
| T10 | Agent changes price of a saved listing | Buyer gets a new alert | Trigger |
| T11 | Set price to -5 | 400 | CHECK (price > 0) |
| T12 | Agent creates a listing | 200, embedding + 3 slots created | Multi-statement transaction |
| T13 | Create listing with type "castle" | 400 | CHECK on property_type |
| T14 | Buyer calls agent API | 403 | Role-based authorization |
| T15 | Full-text search "garden" | Results | GIN index, tsvector |
| T16 | Add preference note, get recommendations | Results | Buyer-preference embeddings |

## Manual checks for the demo
- Open two browser windows (normal + incognito) logged in as two buyers, click the same slot: only one succeeds.
- `SELECT * FROM price_history ORDER BY changed_at DESC;` after a price change.
- `EXPLAIN ANALYZE` on the hybrid query to show index usage.
