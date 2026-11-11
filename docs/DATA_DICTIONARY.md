# Data Dictionary

| Table | Purpose | Key columns and constraints |
|---|---|---|
| users | Every login account | `email` UNIQUE + format CHECK; `role` CHECK in (buyer, agent, admin); `password_hash` is bcrypt |
| agents | Agent profile, 1:1 with a user | `user_id` UNIQUE FK (ON DELETE CASCADE); `license_no` UNIQUE |
| neighborhoods | Location lookup | UNIQUE (name, city) |
| listings | Property for sale | `price` CHECK > 0; `bedrooms`/`bathrooms` CHECK >= 0; `property_type` and `status` CHECK enums; `search_tsv` generated tsvector for full-text search |
| listing_embeddings | Vector store (pgvector) | `embedding vector(384)`; HNSW index with cosine ops; one row per listing |
| buyer_preferences | Buyer free-text taste notes + embeddings | averaged to recommend listings |
| viewing_slots | Bookable time slots | UNIQUE (listing_id, slot_start); `is_booked` flag |
| viewings | A buyer's booking | `slot_id` UNIQUE, so a slot can be booked once |
| saved_listings | Buyer wishlist (M:N) | composite PK (buyer_id, listing_id) |
| price_history | Written only by trigger `trg_price_change` | old and new price with timestamp |
| alerts | Price-change notifications, written by the trigger | `is_read` flag |
| sales | Completed sale, written by `sp_record_sale` | `listing_id` UNIQUE, `sale_price` CHECK > 0 |

## Database objects
| Object | Type | File |
|---|---|---|
| `idx_listings_price`, `idx_listings_filter` | B-tree indexes | db/02_indexes_views.sql |
| `idx_listings_tsv` | GIN full-text index | db/02_indexes_views.sql |
| `idx_listing_emb` | HNSW vector index (cosine) | db/02_indexes_views.sql |
| `v_active_listings`, `v_agent_performance` | Views | db/02_indexes_views.sql |
| `fn_price_change` / `trg_price_change` | Trigger function + trigger | db/03_triggers_procedures.sql |
| `sp_record_sale` | Stored procedure | db/03_triggers_procedures.sql |
