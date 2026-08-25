INSERT OR IGNORE INTO story_categories (id, name, slug) VALUES
  (lower(hex(randomblob(16))), 'Wedding', 'wedding'),
  (lower(hex(randomblob(16))), 'Portrait', 'portrait'),
  (lower(hex(randomblob(16))), 'Family', 'family'),
  (lower(hex(randomblob(16))), 'Elopement', 'elopement'),
  (lower(hex(randomblob(16))), 'Couple', 'couple'),
  (lower(hex(randomblob(16))), 'Travel', 'travel');
