PRAGMA foreign_keys = ON;

-- =========================================================
-- PAGE BUILDER
-- Home, About and Destination pages can be assembled from the
-- same block system used by Stories.
-- =========================================================

CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  page_type TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE page_blocks (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE INDEX idx_pages_type ON pages(page_type);
CREATE INDEX idx_page_blocks_page ON page_blocks(page_id, sort_order);

-- Story blocks use the same flexible payload model so every block
-- can carry its own fields without changing the schema for each new block.
ALTER TABLE story_blocks ADD COLUMN data TEXT NOT NULL DEFAULT '{}';

-- Allow a Story to reference multiple destinations while retaining
-- the existing destination_id field for backwards compatibility.
CREATE TABLE story_destinations (
  story_id TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (story_id, destination_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

CREATE INDEX idx_story_destinations_destination
  ON story_destinations(destination_id, sort_order);

-- Seed the system pages. Content remains empty until the admin builds it.
INSERT OR IGNORE INTO pages (id, slug, title, page_type)
VALUES
  ('page-home', 'home', 'Home', 'home'),
  ('page-about', 'about', 'About', 'about');
