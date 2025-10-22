-- TinyWebDB Schema for Vercel Postgres
-- PostgreSQL serverless database

-- Drop table if exists (for migrations)
DROP TABLE IF EXISTS stored_data;

-- Create stored_data table
CREATE TABLE stored_data (
  tag TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on date for faster sorting/filtering
CREATE INDEX idx_stored_data_date ON stored_data(date);

-- Note: PostgreSQL automatically creates an index for PRIMARY KEY
