-- 01_schema.sql  (DDL: CREATE, PK/FK, constraints) -- owner: Person A
CREATE EXTENSION IF NOT EXISTS vector;

DROP TABLE IF EXISTS alerts, price_history, sales, saved_listings, viewings, viewing_slots,
  buyer_preferences, listing_embeddings, listings, neighborhoods, agents, users CASCADE;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('buyer','agent','admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agents (
  agent_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  license_no VARCHAR(30) NOT NULL UNIQUE,
  agency_name VARCHAR(100),
  phone VARCHAR(15)
);

CREATE TABLE neighborhoods (
  neighborhood_id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  city VARCHAR(80) NOT NULL,
  UNIQUE (name, city)
);

CREATE TABLE listings (
  listing_id SERIAL PRIMARY KEY,
  agent_id INT NOT NULL REFERENCES agents(agent_id),
  neighborhood_id INT NOT NULL REFERENCES neighborhoods(neighborhood_id),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment','villa','house','plot')),
  price NUMERIC(12,2) NOT NULL CHECK (price > 0),
  bedrooms INT NOT NULL CHECK (bedrooms >= 0),
  bathrooms INT NOT NULL CHECK (bathrooms >= 0),
  area_sqft INT CHECK (area_sqft > 0),
  status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','sold')),
  created_at TIMESTAMPTZ DEFAULT now(),
  search_tsv tsvector GENERATED ALWAYS AS
    (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) STORED
);

-- Vector side: one 384-d embedding per listing (title + description)
CREATE TABLE listing_embeddings (
  listing_id INT PRIMARY KEY REFERENCES listings(listing_id) ON DELETE CASCADE,
  embedding vector(384) NOT NULL,
  model_name VARCHAR(60) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE buyer_preferences (
  pref_id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  embedding vector(384) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE viewing_slots (
  slot_id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (listing_id, slot_start)
);

CREATE TABLE viewings (
  viewing_id SERIAL PRIMARY KEY,
  slot_id INT NOT NULL UNIQUE REFERENCES viewing_slots(slot_id),
  buyer_id INT NOT NULL REFERENCES users(user_id),
  status VARCHAR(10) NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','cancelled','completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE saved_listings (
  buyer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  listing_id INT REFERENCES listings(listing_id) ON DELETE CASCADE,
  PRIMARY KEY (buyer_id, listing_id)
);

CREATE TABLE price_history (
  history_id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
  old_price NUMERIC(12,2) NOT NULL,
  new_price NUMERIC(12,2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE alerts (
  alert_id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_id INT NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sales (
  sale_id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL UNIQUE REFERENCES listings(listing_id),
  buyer_id INT NOT NULL REFERENCES users(user_id),
  sale_price NUMERIC(12,2) NOT NULL CHECK (sale_price > 0),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE
);
