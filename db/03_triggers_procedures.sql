-- 03_triggers_procedures.sql  (trigger + stored procedure) -- owner: Person B

-- TRIGGER: whenever a listing's price changes -> log history + alert every buyer who saved it
CREATE OR REPLACE FUNCTION fn_price_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO price_history(listing_id, old_price, new_price)
  VALUES (OLD.listing_id, OLD.price, NEW.price);

  INSERT INTO alerts(buyer_id, listing_id, message)
  SELECT s.buyer_id, NEW.listing_id,
         format('Price of "%s" changed from %s to %s', NEW.title, OLD.price, NEW.price)
  FROM saved_listings s
  WHERE s.listing_id = NEW.listing_id;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_price_change ON listings;
CREATE TRIGGER trg_price_change
AFTER UPDATE OF price ON listings
FOR EACH ROW WHEN (OLD.price IS DISTINCT FROM NEW.price)
EXECUTE FUNCTION fn_price_change();

-- STORED PROCEDURE: record a sale atomically (insert sale + mark sold + close open slots)
CREATE OR REPLACE PROCEDURE sp_record_sale(p_listing INT, p_buyer INT, p_price NUMERIC)
LANGUAGE plpgsql AS $$
DECLARE v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM listings WHERE listing_id = p_listing FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Listing % does not exist', p_listing; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Listing % is not available', p_listing; END IF;
  INSERT INTO sales(listing_id, buyer_id, sale_price) VALUES (p_listing, p_buyer, p_price);
  UPDATE listings SET status = 'sold' WHERE listing_id = p_listing;
  UPDATE viewing_slots SET is_booked = TRUE WHERE listing_id = p_listing;
END $$;
