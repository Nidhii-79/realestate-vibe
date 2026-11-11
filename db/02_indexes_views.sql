-- 02_indexes_views.sql  (indexes, full-text, vector index, views) -- owner: Person A
CREATE INDEX idx_listings_price  ON listings(price);
CREATE INDEX idx_listings_filter ON listings(status, bedrooms, property_type);
CREATE INDEX idx_listings_tsv    ON listings USING GIN (search_tsv);               -- full-text search
CREATE INDEX idx_listing_emb     ON listing_embeddings USING hnsw (embedding vector_cosine_ops); -- vector search

CREATE OR REPLACE VIEW v_active_listings AS
SELECT l.listing_id, l.title, l.price, l.bedrooms, l.property_type,
       n.name AS neighborhood, n.city, u.full_name AS agent_name
FROM listings l
JOIN neighborhoods n USING (neighborhood_id)
JOIN agents a USING (agent_id)
JOIN users u ON u.user_id = a.user_id
WHERE l.status = 'active';

CREATE OR REPLACE VIEW v_agent_performance AS
SELECT a.agent_id, u.full_name,
       COUNT(DISTINCT l.listing_id) AS total_listings,
       COUNT(s.sale_id)             AS sold,
       COALESCE(SUM(s.sale_price),0) AS revenue
FROM agents a
JOIN users u ON u.user_id = a.user_id
LEFT JOIN listings l ON l.agent_id = a.agent_id
LEFT JOIN sales s ON s.listing_id = l.listing_id
GROUP BY a.agent_id, u.full_name;
