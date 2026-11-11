-- 04_alter_drop_demo.sql  (ALTER / DROP demonstration, safe to re-run) -- owner: Person B
ALTER TABLE listings ADD COLUMN IF NOT EXISTS furnishing VARCHAR(20)
  CHECK (furnishing IN ('furnished','semi-furnished','unfurnished'));
ALTER TABLE agents ALTER COLUMN agency_name SET DEFAULT 'Independent';

CREATE TABLE IF NOT EXISTS scratch_demo (id INT PRIMARY KEY, note TEXT);
CREATE INDEX IF NOT EXISTS idx_scratch_note ON scratch_demo(note);
DROP INDEX IF EXISTS idx_scratch_note;
DROP TABLE IF EXISTS scratch_demo;
