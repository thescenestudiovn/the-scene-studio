-- Seed the Contact page so the admin Page Builder never falls back to Home.
INSERT OR IGNORE INTO pages (
  id, slug, title, page_type, seo_title, seo_description, published
)
VALUES (
  'page-contact',
  'contact',
  'Contact',
  'contact',
  'Contact — The Scene Studio',
  'Contact The Scene Studio for destination wedding photography and films in Vietnam and beyond.',
  1
);
