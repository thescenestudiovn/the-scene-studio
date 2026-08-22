from pathlib import Path
import re

path = Path('app/admin/stories/[id]/page.tsx')
text = path.read_text()

if 'import ImageBlock from "./ImageBlock";' not in text:
    text = text.replace('import { mediaUrl } from "../../../../lib/media";\n', 'import { mediaUrl } from "../../../../lib/media";\nimport ImageBlock from "./ImageBlock";\n')

text = text.replace(
    'media:Media[]};',
    'media:Media[];data?:string|Record<string,unknown>|null};',
    1,
)

if 'async function reorderBlockMedia' not in text:
    marker = ' async function removeMedia(blockId:string,mediaId:string)'
    fn = ''' async function reorderBlockMedia(blockId:string,mediaIds:string[]){try{for(let index=0;index<mediaIds.length;index++){const response=await fetch(`/api/admin/stories/${id}/blocks/${blockId}/media`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({media_id:mediaIds[index],sort_order:index})});const data=await response.json() as {success:boolean;error?:string};if(!response.ok||!data.success)throw new Error(data.error||"Failed to reorder photos")}}catch(e){setMessage(e instanceof Error?e.message:"Failed to reorder photos")}finally{await load()}}\n'''
    if marker not in text:
        raise SystemExit('removeMedia marker not found')
    text = text.replace(marker, fn + marker, 1)

if 'async function duplicateBlock' not in text:
    marker = ' async function deleteBlock(blockId:string)'
    fn = ''' async function duplicateBlock(block:Block){try{const rawData=typeof block.data==="string"?JSON.parse(block.data):block.data??{};const response=await fetch(`/api/admin/stories/${id}/blocks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:block.type,sort_order:block.sort_order+1,eyebrow:block.eyebrow,title:block.title,body:block.body,data:rawData})});const data=await response.json() as {success:boolean;block?:Block;error?:string};if(!response.ok||!data.success||!data.block)throw new Error(data.error||"Failed to duplicate block");for(let index=0;index<block.media.length;index++){const media=block.media[index];await fetch(`/api/admin/stories/${id}/blocks/${data.block.id}/media`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({media_id:media.id,sort_order:index})})}setMessage("Block duplicated.");await load()}catch(e){setMessage(e instanceof Error?e.message:"Failed to duplicate block")}}\n'''
    if marker not in text:
        raise SystemExit('deleteBlock marker not found')
    text = text.replace(marker, fn + marker, 1)

needle = 'const textType=TEXT_TYPES.find(item=>item[0]===block.type);const isText=!!textType;return <div key={block.id} className="group relative border border-[#d9d3ca] bg-white p-7 lg:p-9">'
replacement = '''const textType=TEXT_TYPES.find(item=>item[0]===block.type);const isText=!!textType;if(block.type==="image")return <div key={block.id} className="group relative border border-[#d9d3ca] bg-white p-7 lg:p-9"><div className="mb-7 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="text-[10px] uppercase tracking-[0.18em] text-[#8a857d]">{String(index+1).padStart(2,"0")}</span><span className="rounded-full bg-[#f0ece5] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#68635b]">Image</span></div><div className="flex items-center gap-4"><button onClick={()=>void duplicateBlock(block)} className="text-[10px] uppercase tracking-[0.14em] text-[#77736c]">Duplicate</button><button onClick={()=>void deleteBlock(block.id)} className="text-[10px] uppercase tracking-[0.14em] text-[#9a4d42]">Delete</button></div></div><ImageBlock data={block.data} media={block.media} onChange={data=>void updateBlock(block,{data:JSON.stringify(data)})} onAddPhotos={()=>openBlockPicker(block.id)} onRemovePhoto={mediaId=>void removeMedia(block.id,mediaId)} onReorderMedia={mediaIds=>void reorderBlockMedia(block.id,mediaIds)}/></div>;return <div key={block.id} className="group relative border border-[#d9d3ca] bg-white p-7 lg:p-9">'''
if needle not in text:
    raise SystemExit('story block render anchor not found; page may have changed')
text = text.replace(needle, replacement, 1)

path.write_text(text)
print('ImageBlock wired into', path)
