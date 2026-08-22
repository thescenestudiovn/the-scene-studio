-- Gallery page hero content is editable from Admin > Collections.
INSERT OR IGNORE INTO pages (id, slug, title, page_type, seo_title, seo_description)
VALUES (
  'page-gallery',
  'gallery',
  'Gallery',
  'gallery',
  'Gallery — The Scene Studio',
  'A living archive of celebrations, destinations and stories photographed around the world.'
);

INSERT OR IGNORE INTO page_blocks (id, page_id, type, sort_order, data)
VALUES (
  'gallery-hero',
  'page-gallery',
  'hero',
  0,
  '{"eyebrow":"Collections","body":"One collection represents one client gallery. Photos are managed inside each collection and can be reused by Stories."}'
);
