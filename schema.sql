-- D1 schema for the sync service.
-- Apply with:
--   npx wrangler d1 execute sarf --file=schema.sql            (local)
--   npx wrangler d1 execute sarf --remote --file=schema.sql   (live)
--
-- One person, several devices: the documents are one row each. Adding
-- multi-user later means a users table and a user_id column on both tables;
-- nothing else in the design changes.

CREATE TABLE IF NOT EXISTS devices (
  id          TEXT PRIMARY KEY,
  token_hash  TEXT NOT NULL UNIQUE,   -- sha-256 of the bearer token, never the token
  label       TEXT,
  created_at  INTEGER NOT NULL,
  last_seen   INTEGER
);

CREATE TABLE IF NOT EXISTS docs (
  name        TEXT PRIMARY KEY,       -- 'progress' | 'content'
  body        TEXT NOT NULL,          -- JSON
  rev         INTEGER NOT NULL,       -- bumped on every accepted write
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip          TEXT NOT NULL,
  at          INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_at ON login_attempts (ip, at);
