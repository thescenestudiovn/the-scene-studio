ALTER TABLE stories ADD COLUMN tags TEXT;
ALTER TABLE stories ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stories ADD COLUMN hide_from_search INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stories ADD COLUMN social_media_id TEXT;
ALTER TABLE stories ADD COLUMN published_at TEXT;

CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(published);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(featured);
