export type Media = {
  id: string;
  collection_id?: string | null;
  type?: string;
  path: string;
  filename: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

export type StoryBlock = {
  id: string;
  story_id?: string;
  type: string;
  variant?: string | null;
  sort_order: number;
  parent_block_id?: string | null;
  is_visible?: number;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  media: Media[];
  data?: Record<string, unknown>;
};

export type StoryCategory = { id: string; name: string; slug: string };
export type StoryLocation = { id: string; name: string; slug: string; city?: string | null; country?: string | null };
export type Destination = { id: string; name: string; country?: string; country_name?: string; slug: string; region?: string | null };

export type Story = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  locations?: string | null;
  date: string | null;
  category: string | null;
  categories?: string | null;
  description: string | null;
  destination_id?: string | null;
  destination_name?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published: number;
  published_at?: string | null;
  cover_media_id?: string | null;
  cover_path?: string | null;
  cover_filename?: string | null;
  tags?: string | null;
  featured: number;
  hide_from_search: number;
  social_media_id?: string | null;
  social_path?: string | null;
  social_filename?: string | null;
};
