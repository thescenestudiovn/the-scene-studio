from pathlib import Path

path = Path('app/admin/stories/[id]/page.tsx')
text = path.read_text()

text = text.replace(
    'import { mediaUrl } from "../../../../lib/media";\n',
    'import { mediaUrl } from "../../../../lib/media";\nimport ImageTextBlock from "./ImageTextBlock";\n'
)

text = text.replace(
    'type Block={id:string;type:string;sort_order:number;eyebrow:string|null;title:string|null;body:string|null;media:Media[]};',
    'type Block={id:string;type:string;sort_order:number;eyebrow:string|null;title:string|null;body:string|null;media:Media[];data?:string|Record<string,unknown>|null};'
)

text = text.replace(
    '["text","Text","Text and typography"],',
    '["text","Text","Text and typography"],["image-text","Image with Text","Editorial image and text layouts"],'
)

needle = 'const isText=!!textType;return <div key={block.id} className="group relative border border-[#d9d3ca] bg-white p-7 lg:p-9">'
replacement = '''const isText=!!textType;\nif(block.type==="image-text")return <div key={block.id} className="group relative border border-[#d9d3ca] bg-white p-7 lg:p-9"><div className="mb-7 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">{String(index+1).padStart(2,"0")}</span><span className="rounded-full bg-[#f0ece5] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#68635b]">Image with Text</span></div><button onClick={()=>void deleteBlock(block.id)} className="text-[10px] uppercase tracking-[0.14em] text-[#9a4d42] opacity-0 transition group-hover:opacity-100">Delete</button></div><ImageTextBlock data={block.data} media={block.media} onChange={data=>void updateBlock(block,{data:JSON.stringify(data)})} onAddPhotos={()=>openBlockPicker(block.id)} onRemovePhoto={mediaId=>void removeMedia(block.id,mediaId)}/></div>;\nreturn <div key={block.id} className="group relative border border-[#d9d3ca] bg-white p-7 lg:p-9">'''
if needle not in text:
    raise SystemExit('Could not find story block render anchor')
text = text.replace(needle, replacement, 1)

# Limit media attached to an Image with Text block to the selected layout's maximum.
needle = 'const existing=new Set(block.media.map(item=>item.id));const ids=selectedMedia.filter(mediaId=>!existing.has(mediaId));'
replacement = 'const existing=new Set(block.media.map(item=>item.id));let ids=selectedMedia.filter(mediaId=>!existing.has(mediaId));if(block.type==="image-text"){const maxByLayout:{[key:string]:number}={overlay:1,"2-columns":2,"3-columns":3,"4-columns":4,caption:1,"small-caption":1,"image-text":1,"text-image":1};let layout="image-text";try{const parsed=typeof block.data==="string"?JSON.parse(block.data):block.data;layout=typeof parsed?.layout==="string"?parsed.layout:"image-text";}catch{}const max=maxByLayout[layout]??1;ids=ids.slice(0,Math.max(0,max-block.media.length));}'
if needle not in text:
    raise SystemExit('Could not find media attach anchor')
text = text.replace(needle, replacement, 1)

path.write_text(text)
print(f'Updated {path}')
