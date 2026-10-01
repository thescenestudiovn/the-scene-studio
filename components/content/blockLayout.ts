export const blockLayout = {
  section: {
    compact: "px-6 py-16 md:px-10 md:py-24",
    spacious: "px-6 py-20 md:px-10 md:py-32",
    edgeToEdge: "",
  },
  container: {
    narrow: "max-w-3xl",
    text: "max-w-4xl",
    medium: "max-w-5xl",
    content: "max-w-6xl",
    wide: "max-w-7xl",
  },
  image: {
    standard: "aspect-[4/3]",
    wide: "aspect-[16/9]",
    cover: "aspect-[16/7]",
    split: "aspect-[3/2]",
  },
  gallery: {
    carouselItem: "w-[82%] md:w-[32%]",
    carouselHeight: "h-[58vh]",
    slideshowHeight: "h-[70vh] md:h-[78vh]",
  },
  typography: {
    display: "font-serif text-5xl tracking-[-0.03em] md:text-7xl",
    heading: "font-serif text-4xl md:text-6xl",
    blockHeading: "font-serif text-2xl leading-tight md:text-3xl",
    eyebrow: "text-xs uppercase tracking-[0.2em] text-[#77736c]",
    body: "text-sm leading-7 text-[#77736c]",
  },
} as const;

export const blockGrid = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
} as const;

export function imageWithTextContainer(variant: string) {
  if (variant === "text-overlay-full") return blockLayout.container.wide;
  if (variant === "text-overlay-medium") return blockLayout.container.medium;
  return blockLayout.container.content;
}

export function textBelowContainer(variant: string) {
  return variant === "text-below-medium"
    ? blockLayout.container.narrow
    : blockLayout.container.medium;
}

export function splitImageRatio(variant: string) {
  return variant.endsWith("-large")
    ? blockLayout.image.standard
    : blockLayout.image.split;
}

export function imageBlockContainer(variant: string) {
  if (variant === "medium") return blockLayout.container.narrow;
  if (variant === "full-width") return blockLayout.container.wide;
  return blockLayout.container.medium;
}
