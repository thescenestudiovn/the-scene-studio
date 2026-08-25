CREATE TABLE IF NOT EXISTS story_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  city TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_category_relations (
  story_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (story_id, category_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES story_categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS story_location_relations (
  story_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  PRIMARY KEY (story_id, location_id),
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO story_categories (id, name, slug)
SELECT lower(hex(randomblob(16))), category, lower(category)
FROM stories
WHERE category IS NOT NULL AND trim(category) <> '';

INSERT OR IGNORE INTO locations (id, name, slug)
SELECT lower(hex(randomblob(16))), location, lower(location)
FROM stories
WHERE location IS NOT NULL AND trim(location) <> '';

INSERT OR IGNORE INTO story_category_relations (story_id, category_id)
SELECT s.id, c.id
FROM stories s
JOIN story_categories c ON c.name = s.category
WHERE s.category IS NOT NULL AND trim(s.category) <> '';

INSERT OR IGNORE INTO story_location_relations (story_id, location_id)
SELECT s.id, l.id
FROM stories s
JOIN locations l ON l.name = s.location
WHERE s.location IS NOT NULL AND trim(s.location) <> '';
