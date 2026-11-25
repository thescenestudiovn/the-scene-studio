-- Expand site_settings for Header, Footer, SEO, and WhatsApp
ALTER TABLE site_settings ADD COLUMN whatsapp TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN logo_url TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN header_studio_name TEXT DEFAULT 'The Scene Studio';
ALTER TABLE site_settings ADD COLUMN footer_bio TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN footer_copyright TEXT DEFAULT '© 2026 The Scene Studio';
ALTER TABLE site_settings ADD COLUMN default_meta_title TEXT DEFAULT 'Wedding Stories — The Scene Studio';
ALTER TABLE site_settings ADD COLUMN default_meta_description TEXT DEFAULT 'Editorial and documentary wedding photography and cinematography by The Scene Studio.';
ALTER TABLE site_settings ADD COLUMN default_og_image TEXT DEFAULT '';
