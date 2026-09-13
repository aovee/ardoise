-- Recipes + meal planning schema for Turso / libSQL.
-- Apply with:  turso db shell <your-db-name> < server/database/schema.sql

CREATE TABLE IF NOT EXISTS recipes (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  prep_time   INTEGER NOT NULL DEFAULT 0,
  cook_time   INTEGER NOT NULL DEFAULT 0,
  categories  TEXT,                 -- JSON array of strings
  ingredients TEXT,                 -- JSON array of { name, quantity: { amount, unit } }
  servings    INTEGER NOT NULL DEFAULT 1,
  image       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  date       TEXT NOT NULL,          -- ISO date, e.g. 2026-09-10
  meal_type  TEXT NOT NULL,          -- breakfast | lunch | dinner | …
  recipe_id  TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  servings   INTEGER NOT NULL DEFAULT 1,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date
  ON meal_plans (user_id, date);