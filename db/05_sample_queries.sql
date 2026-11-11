-- 05_sample_queries.sql  (important queries for the report/viva) -- owner: Person B
-- 1. JOIN + ORDER BY: active listings with agent and neighborhood
SELECT * FROM v_active_listings ORDER BY price DESC LIMIT 10;

-- 2. GROUP BY + HAVING + aggregates: neighborhoods with avg price above overall average
SELECT n.name, COUNT(*) AS listings, ROUND(AVG(l.price)) AS avg_price
FROM listings l JOIN neighborhoods n USING (neighborhood_id)
GROUP BY n.name
HAVING AVG(l.price) > (SELECT AVG(price) FROM listings)   -- subquery
ORDER BY avg_price DESC;

-- 3. Agent leaderboard (view)
SELECT * FROM v_agent_performance ORDER BY revenue DESC;

-- 4. Full-text search
SELECT listing_id, title, ts_rank(search_tsv, q) AS rank
FROM listings, plainto_tsquery('english', 'garden quiet') q
WHERE search_tsv @@ q ORDER BY rank DESC LIMIT 5;

-- 5. Vector similarity (cosine) using an existing listing as the query vector
SELECT l.listing_id, l.title, 1 - (e.embedding <=> (SELECT embedding FROM listing_embeddings WHERE listing_id = 1)) AS similarity
FROM listings l JOIN listing_embeddings e USING (listing_id)
WHERE l.listing_id <> 1 ORDER BY e.embedding <=> (SELECT embedding FROM listing_embeddings WHERE listing_id = 1) LIMIT 5;

-- 6. HYBRID: structured filters + semantic ranking (the project's core query)
--    (:v is a 384-d vector literal supplied by the app)
-- SELECT l.listing_id, l.title, l.price FROM listings l JOIN listing_embeddings e USING (listing_id)
-- WHERE l.status='active' AND l.price BETWEEN 3000000 AND 9000000 AND l.bedrooms >= 2
-- ORDER BY e.embedding <=> :v LIMIT 10;

-- 7. Trigger demo
-- UPDATE listings SET price = price - 100000 WHERE listing_id = 1;
-- SELECT * FROM price_history WHERE listing_id = 1;  SELECT * FROM alerts ORDER BY alert_id DESC LIMIT 3;

-- 8. Stored procedure demo
-- CALL sp_record_sale(2, 3, 6500000);
