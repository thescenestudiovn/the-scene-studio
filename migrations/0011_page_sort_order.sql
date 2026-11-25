-- Migration 0011: Add sort_order to pages for menu and list ordering
ALTER TABLE pages ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
