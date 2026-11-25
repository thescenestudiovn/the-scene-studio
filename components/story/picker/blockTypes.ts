export type TextBlockVariant =
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "wide"
  | "regular"
  | "narrow"
  | "columns-2"
  | "columns-3"
  | "columns-4";

export type ImageBlockVariant =
  | "large"
  | "medium"
  | "full-width"
  | "columns-2"
  | "columns-3"
  | "columns-4"
  | "grid-vertical"
  | "grid-horizontal"
  | "grid-square"
  | "grid-stacked"
  | "slideshow"
  | "carousel"
  | "text-overlay-large"
  | "text-overlay-medium"
  | "text-overlay-full"
  | "text-columns-2"
  | "text-columns-3"
  | "text-columns-4"
  | "text-below-large"
  | "text-below-medium"
  | "text-left-regular"
  | "text-right-regular"
  | "text-left-large"
  | "text-right-large";

export type VideoBlockVariant =
  | "banner-video"
  | "video-large"
  | "video-medium"
  | "video-full"
  | "video-banner-center"
  | "video-banner-bottom"
  | "video-banner-split"
  | "video-text-large"
  | "video-text-medium"
  | "video-text-small"
  | "video-text-split"
  | "video-text-split-large"
  | "video-text-split-right";

export type SocialBlockVariant =
  | "instagram-grid"
  | "instagram-card"
  | "instagram-split"
  | "social-icons-minimal"
  | "social-icons-solid"
  | "social-icons-outline"
  | "social-icons-dark";

export type OthersBlockVariant =
  | "spacer"
  | "divider-large"
  | "divider-medium"
  | "divider-small"
  | "button"
  | "embed-code";

export type FlexBlockVariant =
  | "bio-editorial"
  | "bio-lifestyle"
  | "bio-moody"
  | "team-grid"
  | "team-arch"
  | "team-duo"
  | "team-card"
  | "team-magazine"
  | "team-minimal"
  | "slider-banner-full"
  | "slider-banner-center"
  | "slider-banner-minimal"
  | "slider-banner-card"
  | "slider-banner-split"
  | "slider-banner-dots"
  | "portfolio-grid"
  | "portfolio-split"
  | "portfolio-masonry"
  | "portfolio-editorial"
  | "portfolio-lifestyle"
  | "portfolio-duo"
  | "services-packages"
  | "services-feature"
  | "services-duo"
  | "services-list"
  | "services-cards"
  | "services-editorial"
  | "testimonials-portrait"
  | "testimonials-card"
  | "testimonials-split"
  | "events-list"
  | "events-grid"
  | "events-banner"
  | "events-timeline"
  | "partners-row"
  | "partners-minimal"
  | "partners-grid"
  | "partners-card"
  | "faq-accordion"
  | "faq-2col"
  | "faq-card"
  | "flex-blank";

export type LinksBlockVariant = "links-list" | "links-buttons" | "links-cards";

export type ContentBlockSelection =
  | { category: "text"; variant: TextBlockVariant }
  | { category: "image"; variant: ImageBlockVariant; data: { collection_id: string; media_ids: string[] } }
  | { category: "video"; variant: VideoBlockVariant; data?: Record<string, unknown> }
  | { category: "content"; variant: string; data?: Record<string, unknown> }
  | { category: "links"; variant: LinksBlockVariant; data?: Record<string, unknown> }
  | { category: "blog"; variant: string; data?: Record<string, unknown> }
  | { category: "contact"; variant: string; data?: Record<string, unknown> }
  | { category: "social"; variant: SocialBlockVariant; data?: Record<string, unknown> }
  | { category: "others"; variant: OthersBlockVariant; data?: Record<string, unknown> }
  | { category: "flex"; variant: FlexBlockVariant; data?: Record<string, unknown> };

export const BLOCK_CATEGORIES = [
  ["text", "Text"],
  ["image", "Image"],
  ["content", "Content"],
  ["links", "Links"],
  ["blog", "Blog"],
  ["video", "Video"],
  ["contact", "Contact"],
  ["social", "Social"],
  ["others", "Others"],
  ["flex", "Flex Block"],
] as const;
