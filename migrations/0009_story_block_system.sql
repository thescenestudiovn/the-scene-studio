PRAGMA foreign_keys = ON;

-- Generic block identity. Existing story_blocks data remains backwards compatible.
ALTER TABLE story_blocks ADD COLUMN variant TEXT;
ALTER TABLE story_blocks ADD COLUMN parent_block_id TEXT REFERENCES story_blocks(id) ON DELETE CASCADE;
ALTER TABLE story_blocks ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_story_blocks_story_order
  ON story_blocks(story_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_story_blocks_parent_order
  ON story_blocks(parent_block_id, sort_order);

-- Each block family gets its own data table. The generic story_blocks row owns
-- identity/order; these tables own family-specific data and can evolve independently.
CREATE TABLE IF NOT EXISTS text_block_data (
  block_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  columns_data TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS image_block_data (
  block_id TEXT PRIMARY KEY,
  layout TEXT NOT NULL DEFAULT 'single',
  caption TEXT,
  alt_text TEXT,
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_block_data (
  block_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS links_block_data (
  block_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blog_block_data (
  block_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS video_block_data (
  block_id TEXT PRIMARY KEY,
  provider TEXT,
  video_id TEXT,
  url TEXT,
  poster_media_id TEXT,
  settings TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE,
  FOREIGN KEY (poster_media_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contact_block_data (
  block_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_block_data (
  block_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS others_block_data (
  block_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flex_block_data (
  block_id TEXT PRIMARY KEY,
  layout TEXT NOT NULL DEFAULT 'freeform',
  settings TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (block_id) REFERENCES story_blocks(id) ON DELETE CASCADE
);
