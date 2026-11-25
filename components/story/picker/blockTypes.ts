export type TextBlockVariant = "heading-1" | "heading-2" | "heading-3" | "wide" | "regular" | "narrow" | "columns-2" | "columns-3" | "columns-4";
export type ImageBlockVariant = "large" | "medium" | "full-width" | "columns-2" | "columns-3" | "columns-4" | "grid-vertical" | "grid-horizontal" | "grid-square" | "grid-stacked" | "slideshow" | "carousel" | "text-overlay-large" | "text-overlay-medium" | "text-overlay-full" | "text-columns-2" | "text-columns-3" | "text-columns-4" | "text-below-large" | "text-below-medium" | "text-left-regular" | "text-right-regular" | "text-left-large" | "text-right-large";
export type VideoBlockVariant =
  | "video-large"
  | "video-medium"
  | "video-full"
  | "video-banner-1"
  | "video-banner-2"
  | "video-banner-3"
  | "video-text-large"
  | "video-text-small"
  | "video-text-left"
  | "video-text-right"
  | "video-text-left-large"
  | "video-text-right-large"
  | "banner-video";
export type SocialBlockVariant =
  | "instagram-1"
  | "instagram-2"
  | "instagram-3"
  | "social-links-1"
  | "social-links-2"
  | "social-links-3"
  | "social-links-4";
export type OthersBlockVariant =
  | "spacer"
  | "divider-large"
  | "divider-medium"
  | "divider-small"
  | "button"
  | "embed-code";
export type FlexBlockVariant =
  | "bio-1"
  | "bio-2"
  | "bio-3"
  | "team-1"
  | "team-2"
  | "team-3"
  | "team-4"
  | "team-5"
  | "team-6"
  | "info-1"
  | "info-2"
  | "info-3"
  | "slider-1"
  | "slider-2"
  | "slider-3"
  | "slider-4"
  | "slider-5"
  | "slider-6"
  | "portfolio-1"
  | "portfolio-2"
  | "portfolio-3"
  | "portfolio-4"
  | "portfolio-5"
  | "portfolio-6"
  | "services-1"
  | "services-2"
  | "services-3"
  | "services-4"
  | "services-5"
  | "services-6"
  | "testimonials-1"
  | "testimonials-2"
  | "testimonials-3"
  | "testimonials-4"
  | "testimonials-5"
  | "testimonials-6"
  | "events-1"
  | "events-2"
  | "events-3"
  | "events-4"
  | "events-5"
  | "events-6"
  | "partners-1"
  | "partners-2"
  | "partners-3"
  | "partners-4"
  | "partners-5"
  | "partners-6"
  | "faq-1"
  | "faq-2"
  | "faq-3"
  | "faq-4"
  | "faq-5"
  | "blank";
export type LinksBlockVariant = "links-standard";

export type ContentBlockSelection =
  | { category: "text"; variant: TextBlockVariant }
  | { category: "image"; variant: ImageBlockVariant; data: { collection_id: string; media_ids: string[] } }
  | { category: "content"; variant: VideoBlockVariant; data: { youtube_url: string } }
  | { category: "video"; variant: VideoBlockVariant; data?: { youtube_url?: string } }
  | { category: "social"; variant: SocialBlockVariant; data?: Record<string, unknown> }
  | { category: "others"; variant: OthersBlockVariant; data?: Record<string, unknown> }
  | { category: "flex"; variant: FlexBlockVariant; data?: Record<string, unknown> }
  | { category: "links"; variant: LinksBlockVariant; data?: { links?: Array<{ label: string; url: string }> } };

export const BLOCK_CATEGORIES = [
  ["text", "Text"], ["image", "Image"], ["video", "Video"], ["links", "Links"],
  ["blog", "Blog"], ["contact", "Contact"], ["social", "Social"], ["others", "Others"], ["flex", "Flex Block"],
] as const;
