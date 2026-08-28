"use client";

import type { ContentBlockSelection, ImageBlockVariant } from "./blockTypes";

type Props = { onSelect: (selection: ContentBlockSelection) => void };
type Group = { id: string; label: string; items: Array<[ImageBlockVariant, string, string]> };

const base = "https://assets-pw.pixieset.com/classic-themes/theme-images/thumbnail-photos/blocks/theme_4/";
const groups: Group[] = [
  { id: "images", label: "Images", items: [["large","Large Image","image-large.jpg"],["medium","Medium Image","image-medium.jpg"],["full-width","Full Width Image","image-full.jpg"],["columns-2","Image Columns 2","image-columns-2.jpg"],["columns-3","Image Columns 3","image-columns-3.jpg"],["columns-4","Image Columns 4","image-columns-4.jpg"]] },
  { id: "grids", label: "Grid Galleries", items: [["grid-vertical","Vertical Grid","photo-grid-vertical.jpg"],["grid-horizontal","Horizontal Grid","photo-grid-horizontal.jpg"],["grid-square","Square Grid","photo-grid-square.jpg"],["grid-stacked","Stacked Grid","photo-grid-stacked.jpg"]] },
  { id: "sliders", label: "Slider Galleries", items: [["slideshow","Slideshow","photo-slider-slideshow.jpg"],["carousel","Carousel","photo-slider-carousel.jpg"]] },
  { id: "image-text", label: "Images with Text", items: [["text-overlay-large","Image with Text","image-text-overlay-large.jpg"],["text-overlay-medium","Small Image with Text","image-text-overlay-medium.jpg"],["text-overlay-full","Full Image with Text","image-text-overlay-full.jpg"],["text-columns-2","Image with Text Columns 2","image-columns-and-text-2.jpg"],["text-columns-3","Image with Text Columns 3","image-columns-and-text-3.jpg"],["text-columns-4","Image with Text Columns 4","image-columns-and-text-4.jpg"],["text-below-large","Image with Text","image-text-below-large.jpg"],["text-below-medium","Small Image with Text","image-text-below-medium.jpg"],["text-left-regular","Image with Text Left","image-text-left-regular.jpg"],["text-right-regular","Image with Text Right","image-text-right-regular.jpg"],["text-left-large","Large Image with Text Left","image-text-left-large.jpg"],["text-right-large","Large Image with Text Right","image-text-right-large.jpg"]] },
];

export default function ImageBlockPicker({ onSelect }: Props) {
  return <div className="space-y-9">
    {groups.map(group => <section key={group.id}><div className="mb-4"><p className="text-[10px] uppercase tracking-[0.18em] text-[#8a867e]">{group.label}</p></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{group.items.map(([variant,label,preview]) => <button key={variant} type="button" onClick={() => onSelect({ category: "image", variant, data: { collection_id: "", media_ids: [] } })} className="group overflow-hidden rounded-xl border border-[#ddd9d0] bg-white text-left hover:border-[#aaa59b] hover:shadow-[0_12px_35px_rgba(0,0,0,.06)]"><div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]"><img src={`${base}${preview}`} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/></div><div className="px-5 py-4 text-sm font-medium">{label}</div></button>)}</div></section>)}
  </div>;
}
