PRAGMA foreign_keys = ON;

-- Story child tables already use ON DELETE CASCADE, so deleting a story
-- removes its blocks, block-media mappings, and full-gallery CTA automatically.
-- Keep indexes available for fast cascade/delete lookups.
CREATE INDEX IF NOT EXISTS idx_story_block_media_media ON story_block_media(media_id);
CREATE INDEX IF NOT EXISTS idx_story_gallery_cta_collection ON story_gallery_cta(collection_id);
