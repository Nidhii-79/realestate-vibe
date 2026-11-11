# Report sections owned by Person B

## 7. Next.js Project Tree Structure
```
realestate-vibe/
├── app/
│   ├── layout.jsx, globals.css       # shell + styles
│   ├── page.jsx                      # home: vibe search + filters
│   ├── listings/[id]/page.jsx        # listing detail, price history, booking, save
│   ├── login/ , register/            # auth pages
│   ├── buyer/ , agent/ , admin/      # role dashboards
│   └── api/
│       ├── auth/{register,login,logout,me}   # JWT cookie auth
│       ├── search/ (+ text/)         # hybrid vector search, full-text search
│       ├── listings/ ([id], [id]/slots)      # browse, detail, slots
│       ├── viewings/                 # booking transaction
│       ├── saved/ , alerts/ , recommend/     # wishlist, trigger alerts, preference vectors
│       ├── agent/ (listings, sell)   # create (embeds), price update (trigger), sale (procedure)
│       └── admin/stats/              # view + GROUP BY/HAVING report
├── components/                       # Header, ListingCard, BookSlots, SaveButton, AuthForm
├── lib/                              # db.js (pool), embed.js, auth.js, format.js
├── middleware.js                     # role-based route protection
├── db/                               # SQL scripts 01 to 05
├── scripts/                          # init-db, seed, embed-all, smoke-test
├── docs/                             # ER diagram, data dictionary, testing, report sections
├── docker-compose.yml, .env.example, next.config.mjs, package.json, README.md
```
Key files: `lib/db.js` (connection pool using `DATABASE_URL`), `middleware.js` (auth guard),
`app/api/search/route.js` (hybrid query), `app/api/viewings/route.js` (transaction),
`db/03_triggers_procedures.sql` (trigger + procedure).

## 8. Sample Screenshots checklist (take all of these)
- [ ] `db/01_schema.sql` code (editor) and `\dt` output in psql
- [ ] `\d listings` showing constraints, and `\d listing_embeddings` showing the vector column and HNSW index
- [ ] `SELECT listing_id, left(embedding::text, 60) FROM listing_embeddings LIMIT 3;`
- [ ] Home page with a vibe query and results (with "% vibe match")
- [ ] Same query with filters applied
- [ ] Hybrid query code in `app/api/search/route.js`
- [ ] Buyer dashboard with an unread price alert
- [ ] `price_history` and `alerts` rows after a price change (trigger proof)
- [ ] Double booking error message (transaction rollback)
- [ ] Agent dashboard, admin dashboard
- [ ] `npm run smoke` output (16 passed)
- [ ] GitHub commit history showing both members

## 9. Evaluation Rubrics and Completion Status
Be honest. Edit this table to match what you verified on your own machine.

| Item | Status |
|---|---|
| ER diagram and relational schema | Completed |
| SQL implementation (CREATE, ALTER, DROP, constraints, indexes, views) | Completed |
| DML and complex queries (JOIN, GROUP BY, HAVING, subquery) | Completed |
| Advanced SQL: transaction, trigger, stored procedure, views, indexes, full-text | Completed |
| Vector database: embeddings, HNSW index, cosine search | Completed |
| Hybrid SQL + vector search | Completed |
| Next.js interface (search, detail, dashboards) | Completed |
| API layer, env-based configuration | Completed |
| Authentication and 3 roles | Completed |
| Database-level validation | Completed |
| Automated smoke tests (16) | Completed |
| README and documentation | Completed |
| Cancel/reschedule viewings | Not Completed |
| Image upload for listings | Not Completed |
| Password reset, email notifications | Not Completed |
| Pagination of search results | Partially Completed (top 10 for vibe search, full list for browse) |
