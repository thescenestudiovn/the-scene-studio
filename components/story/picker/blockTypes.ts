export type TextBlockVariant = "heading-1" | "heading-2" | "heading-3" | "wide" | "regular" | "narrow" | "columns-2" | "columns-3" | "columns-4";
export type ImageBlockVariant = "large" | "medium" | "full-width" | "columns-2" | "columns-3" | "columns-4" | "grid-vertical" | "grid-horizontal" | "grid-square" | "grid-stacked" | "slideshow" | "carousel" | "text-overlay-large" | "text-overlay-medium" | "text-overlay-full" | "text-columns-2" | "text-columns-3" | "text-columns-4" | "text-below-large" | "text-below-medium" | "text-left-regular" | "text-right-regular" | "text-left-large" | "text-right-large";
export type VideoBlockVariant = "banner-video";
export type ContentBlockVariant =
  | "banner-1" | "banner-2" | "banner-3" | "banner-headline" | "banner-media" | "banner-slider-1"
  | "info-1" | "info-2" | "info-3"
  | "testimonial-1" | "testimonial-2" | "testimonial-3"
  | "pricing-1" | "pricing-2" | "pricing-3"
  | "faq-1" | "faq-2" | "faq-3"
  | "quote-1" | "quote-2" | "quote-3"
  | "banner-video";
export type ContactBlockVariant = "form-1" | "form-2" | "form-3" | "form-with-text-left" | "form-with-text-right" | "form-with-image-left" | "form-with-image-right";
export type MapBlockVariant = "map-1-full" | "map-1-regular" | "map-2-regular" | "map-3-regular";

export type ContentBlockSelection =
  | { category: "text"; variant: TextBlockVariant; data?: Record<string, unknown> }
  | { category: "image"; variant: ImageBlockVariant; data: { collection_id: string; media_ids: string[] } }
  | { category: "content"; variant: ContentBlockVariant; data?: Record<string, unknown> }
  | { category: "contact"; variant: ContactBlockVariant; data: { title: string; body: string; media_ids: string[] } }
  | { category: "map"; variant: MapBlockVariant; data: { address: string; embed_url: string } };

export const BLOCK_CATEGORIES = [
  ["text", "Text"], ["image", "Image"], ["content", "Content"], ["links", "Links"],
  ["blog", "Blog"], ["contact", "Contact Form"], ["map", "Map"], ["social", "Social"], ["others", "Others"], ["flex", "Flex Block"],
] as const;
