export type TextBlockVariant = "heading-1" | "heading-2" | "heading-3" | "wide" | "regular" | "narrow" | "columns-2" | "columns-3" | "columns-4";

export type ImageBlockVariant = "large" | "medium" | "full-width" | "columns-2" | "columns-3" | "columns-4" | "grid-vertical" | "grid-horizontal" | "grid-square" | "grid-stacked" | "slideshow" | "carousel" | "text-overlay-large" | "text-overlay-medium" | "text-overlay-full" | "text-columns-2" | "text-columns-3" | "text-columns-4" | "text-below-large" | "text-below-medium" | "text-left-regular" | "text-right-regular" | "text-left-large" | "text-right-large";

export type ContentBlockSelection =
  | { category: "text"; variant: TextBlockVariant }
  | { category: "image"; variant: ImageBlockVariant; data: { collection_id: string; media_ids: string[] } };

export const BLOCK_CATEGORIES = [
  ["text", "Text"], ["image", "Image"], ["content", "Content"], ["links", "Links"],
  ["blog", "Blog"], ["video", "Video"], ["contact", "Contact"], ["social", "Social"],
  ["others", "Others"], ["flex", "Flex Block"],
] as const;
