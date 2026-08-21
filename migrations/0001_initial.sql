PRAGMA foreign_keys = ON;

-- =========================================================
-- DESTINATIONS
-- =========================================================

CREATE TABLE destinations (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  country_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT,
  seo_title TEXT,
  seo_description TEXT,
  description TEXT,
  intro_title TEXT,
  intro_text TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- COLLECTIONS
-- A collection is an independent gallery of photos.
-- Stories are NOT locked to a collection.
-- =========================================================

CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  destination_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (destination_id)
    REFERENCES destinations(id)
    ON DELETE SET NULL
);

-- =========================================================
-- MEDIA
-- Individual photos/videos stored on NAS / Cloudflare.
-- =========================================================

CREATE TABLE media (
  id TEXT PRIMARY KEY,
  collection_id TEXT,
  type TEXT NOT NULL DEFAULT 'image',
  path TEXT NOT NULL,
  filename TEXT,
  alt TEXT,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (collection_id)
    REFERENCES collections(id)
    ON DELETE SET NULL
);

-- =========================================================
-- STORIES
-- Blog / editorial stories.
-- =========================================================

CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  location TEXT,
  date TEXT,
  category TEXT,

  seo_title TEXT,
  seo_description TEXT,
  description TEXT,

  cover_media_id TEXT,
  destination_id TEXT,

  published INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (cover_media_id)
    REFERENCES media(id)
    ON DELETE SET NULL,

  FOREIGN KEY (destination_id)
    REFERENCES destinations(id)
    ON DELETE SET NULL
);

-- =========================================================
-- STORY BLOCKS
--
-- The order of blocks is controlled by sort_order.
--
-- type:
--   text
--   image
--   gallery
--   quote
--   credits
-- =========================================================

CREATE TABLE story_blocks (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,

  type TEXT NOT NULL,

  sort_order INTEGER NOT NULL DEFAULT 0,

  eyebrow TEXT,
  title TEXT,
  body TEXT,

  media_id TEXT,

  gallery_title TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE,

  FOREIGN KEY (media_id)
    REFERENCES media(id)
    ON DELETE SET NULL
);

-- =========================================================
-- STORY BLOCK GALLERY
--
-- IMPORTANT:
-- One gallery block can contain ANY number of images.
--
-- A story can select:
--   3 images from Collection A
--   6 images from Collection B
--   12 images from Collection C
--
-- There is NO fixed collection relationship.
-- =========================================================

CREATE TABLE story_block_media (
  block_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (block_id, media_id),

  FOREIGN KEY (block_id)
    REFERENCES story_blocks(id)
    ON DELETE CASCADE,

  FOREIGN KEY (media_id)
    REFERENCES media(id)
    ON DELETE CASCADE
);

-- =========================================================
-- STORY FULL GALLERY CTA
--
-- Each story can optionally show a "View Full Gallery"
-- button and point to ANY gallery / collection.
-- =========================================================

CREATE TABLE story_gallery_cta (
  story_id TEXT PRIMARY KEY,

  enabled INTEGER NOT NULL DEFAULT 0,

  label TEXT NOT NULL DEFAULT 'View Full Gallery',

  collection_id TEXT,

  custom_url TEXT,

  FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE CASCADE,

  FOREIGN KEY (collection_id)
    REFERENCES collections(id)
    ON DELETE SET NULL
);

-- =========================================================
-- FILMS
-- =========================================================

CREATE TABLE films (
  id TEXT PRIMARY KEY,

  title TEXT NOT NULL,
  location TEXT,

  youtube_url TEXT NOT NULL,

  story_id TEXT,
  destination_id TEXT,

  published INTEGER NOT NULL DEFAULT 1,

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (story_id)
    REFERENCES stories(id)
    ON DELETE SET NULL,

  FOREIGN KEY (destination_id)
    REFERENCES destinations(id)
    ON DELETE SET NULL
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_destinations_country
  ON destinations(country);

CREATE INDEX idx_collections_destination
  ON collections(destination_id);

CREATE INDEX idx_media_collection
  ON media(collection_id);

CREATE INDEX idx_stories_destination
  ON stories(destination_id);

CREATE INDEX idx_stories_published
  ON stories(published);

CREATE INDEX idx_story_blocks_story
  ON story_blocks(story_id, sort_order);

CREATE INDEX idx_story_block_media_block
  ON story_block_media(block_id, sort_order);

CREATE INDEX idx_films_story
  ON films(story_id);

CREATE INDEX idx_films_destination
  ON films(destination_id);