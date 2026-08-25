"use client";

import AddBlockTrigger from "../AddBlockTrigger";
import { mediaUrl } from "@/lib/media";
import type { StoryBlock } from "./types";

type Props = { storyId: string; blocks: StoryBlock[]; onBlocksChange: (blocks: StoryBlock[]) => void; onDelete: (blockId: string) => void; onUpdate: (block: StoryBlock, patch: Partial<StoryBlock>) => void };
const TEXT_LABELS: Record<string, string> = { "heading-1": "Heading 1", "heading-2": "Heading 2", "heading-3": "Heading 3", wide: "Wide Text", regular: "Regular Text", narrow: "Narrow Text", "columns-2": "Text Columns 2", "columns-3": "Text Columns 3", "columns-4": "Text Columns 4", "text-h1": "Heading 1", "text-h2": "Heading 2", "text-h3": "Heading 3", "text-wide": "Wide Text", "text-regular": "Regular Text", "text-narrow": "Narrow Text", "text-columns-2": "Text Columns 2", "text-columns-3": "Text Columns 3", "text-columns-4": "Text Columns 4" };

function TextBlockEditor({ block, onChange, onBlur }: { block: StoryBlock; onChange: (patch: Partial<StoryBlock>) => void; onBlur: () => void }) {
  return <div className="space-y-4"><label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Eyebrow</span><input value={block.eyebrow ?? ""} onChange={e => onChange({ eyebrow: e.target.value })} onBlur={onBlur} className="w-full border border-[#d9d3ca] px-4 py-3 text-sm outline-none" /></label><label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Title</span><input value={block.title ?? ""} onChange={e => onChange({ title: e.target.value })} onBlur={onBlur} className="w-full border border-[#d9d3ca] px-4 py-3 text-lg outline-none" /></label><label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">Body</span><textarea value={block.body ?? ""} onChange={e => onChange({ body: e.target.value })} onBlur={onBlur} rows={6} className="w-full resize-y border border-[#d9d3ca] px-4 py-3 text-sm leading-7 outline-none" /></label></div>;
}

function BlockCard({ block, index, blocks, onBlocksChange, onDelete, onUpdate }: { block: StoryBlock; index: number; blocks: StoryBlock[]; onBlocksChange: Props["onBlocksChange"]; onDelete: Props["onDelete"]; onUpdate: Props["onUpdate"] }) {
  const textLabel = TEXT_LABELS[block.variant ?? block.type];
  const isText = block.type === "text" || block.type.startsWith("text-");
  const updateLocal = (patch: Partial<StoryBlock>) => onBlocksChange(blocks.map(item => item.id === block.id ? { ...item, ...patch } : item));
  return <article className="border border-[#d9d3ca] bg-white p-7 lg:p-9"><div className="mb-6 flex items-center justify-between"><div><span className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">Block {index + 1}</span><h2 className="mt-1 font-serif text-2xl">{textLabel ?? block.variant ?? block.type}</h2></div><button type="button" onClick={() => onDelete(block.id)} className="text-[10px] uppercase tracking-[0.15em] text-[#9a4c42]">Delete</button></div>{isText ? <TextBlockEditor block={block} onChange={updateLocal} onBlur={() => onUpdate(block, { eyebrow: block.eyebrow, title: block.title, body: block.body })} /> : <div className="space-y-4"><p className="text-sm text-[#77736c]">This block has its own dedicated editor component.</p>{block.media.length > 0 && <div className="grid grid-cols-3 gap-3">{block.media.map(media => <div key={media.id} className="aspect-square overflow-hidden bg-[#e7e2da]"><img src={mediaUrl(media.path)} alt={media.alt ?? media.filename} className="h-full w-full object-cover" /></div>)}</div>}</div>}</article>;
}

export default function StoryContent({ storyId, blocks, onBlocksChange, onDelete, onUpdate }: Props) {
  const visibleBlocks = blocks.filter(block => block.is_visible !== 0).slice().sort((a, b) => a.sort_order - b.sort_order);
  return <section className="min-w-0"><div className="space-y-5">{visibleBlocks.map((block, index) => <BlockCard key={block.id} block={block} index={index} blocks={blocks} onBlocksChange={onBlocksChange} onDelete={onDelete} onUpdate={onUpdate} />)}</div><div className="mt-6"><AddBlockTrigger storyId={storyId} /></div></section>;
}
