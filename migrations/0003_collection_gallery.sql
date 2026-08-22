PRAGMA foreign_keys = ON;

-- Collection metadata used by the public gallery and SEO.
ALTER TABLE collections ADD COLUMN client_name TEXT;
ALTER TABLE collections ADD COLUMN event_date TEXT;
ALTER TABLE collections ADD COLUMN seo_title TEXT;
ALTER TABLE collections ADD COLUMN seo_description TEXT;
ALTER TABLE collections ADD COLUMN published INTEGER NOT NULL DEFAULT 1;
ALTER TABLE collections ADD COLUMN cover_media_id TEXT;

CREATE INDEX idx_collections_published ON collections(published);
CREATE INDEX idx_collections_event_date ON collections(event_date);

-- A collection cover is a media item belonging to the same collection.
-- SQLite cannot add a foreign key constraint with ALTER TABLE safely here,
-- so the application enforces the relationship when saving a cover.
