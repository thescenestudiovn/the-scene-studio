CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (id, phone, email, instagram, facebook)
VALUES ('global', '', '', '', '');
