CREATE TABLE IF NOT EXISTS collection_cover_positions (
  collection_id TEXT PRIMARY KEY,
  position_x REAL NOT NULL DEFAULT 50,
  position_y REAL NOT NULL DEFAULT 50,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
