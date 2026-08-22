PRAGMA foreign_keys = ON;

ALTER TABLE collections ADD COLUMN client_name TEXT;
ALTER TABLE collections ADD COLUMN event_date TEXT;
ALTER TABLE collections ADD COLUMN seo_title TEXT;
ALTER TABLE collections ADD COLUMN seo_description TEXT;
ALTER TABLE collections ADD COLUMN published INTEGER NOT NULL DEFAULT 1;
ALTER TABLE collections ADD COLUMN cover_media_id TEXT;

CREATE INDEX idx_collections_published ON collections(published);
CREATE INDEX idx_collections_event_date ON collections(event_date);

-- Default editable content for Home and About. Admin can replace/reorder these blocks later.
INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'home-block-hero','page-home','image',0,'{"image_url":"/images/hero/scene-hero.jpg","alt":"Intimate destination wedding in Vietnam"}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-home');
INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'home-block-intro','page-home','content',1,'{"eyebrow":"The Studio","title":"We document the moments that feel like you.","body":"The Scene Studio is a destination wedding photography and film studio based in Vietnam, documenting intimate celebrations in Da Nang, Hoi An, and beautiful destinations around the world.\n\nFrom quiet ceremonies to unforgettable celebrations, our approach is unobtrusive, cinematic, and deeply personal."}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-home');
INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'home-block-image','page-home','image',2,'{"image_url":"/images/studio/scene-studio.jpg","alt":"The Scene Studio wedding photography"}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-home');
INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'home-block-stories','page-home','blog',3,'{"eyebrow":"Selected Stories","title":"Recent celebrations"}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-home');
INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'home-block-contact','page-home','contact',4,'{"title":"For the quiet moments, the wild celebrations, and everything between.","label":"Get in touch","url":"/contact"}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-home');

INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'about-block-intro','page-about','content',0,'{"eyebrow":"About The Scene","title":"We create photographs and films for people who care about how their story feels.","body":"Our approach is quiet and intentional. We give you space to be yourselves while paying close attention to the light, movement, people, and small moments that make the day yours."}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-about');
INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'about-block-image','page-about','image',1,'{"image_url":"/images/studio/scene-studio.jpg","alt":"The Scene Studio"}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-about');
INSERT INTO page_blocks (id,page_id,type,sort_order,data)
SELECT 'about-block-values','page-about','content',2,'{"eyebrow":"What Matters","title":"Presence. Intention. Connection.","body":"We observe rather than direct, allowing real moments to unfold naturally. Every frame has a reason. The experience matters as much as the photographs: we want you to feel comfortable, present, and completely yourselves."}'
WHERE NOT EXISTS (SELECT 1 FROM page_blocks WHERE page_id='page-about');
