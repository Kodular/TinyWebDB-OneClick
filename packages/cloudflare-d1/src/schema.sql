-- TinyWebDB Schema for Cloudflare D1
-- SQLite database at the edge

-- Drop table if exists (for migrations)
DROP TABLE IF EXISTS stored_data;

-- Create stored_data table
CREATE TABLE stored_data (
  tag TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  date TEXT NOT NULL  -- ISO 8601 timestamp
);

-- Create index on date for faster sorting/filtering
CREATE INDEX idx_stored_data_date ON stored_data(date);

-- Create index on tag for faster lookups (redundant as PRIMARY KEY, but explicit)
-- Note: PRIMARY KEY already creates an index in SQLite
