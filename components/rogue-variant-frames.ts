import {reviewedAtlasRoot,reviewedAtlasVariant,sourceAtlasFrames} from './rogue-reviewed-mega-atlases.mjs';
// PokéRogue asset snapshot; failures must leave the caller's existing sprite intact.
const root='https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba/images/pokemon';
type Frame={filename:string;rotated:boolean;frame:{x:number;y:number;w:number;h:number};sourceSize:{w:number;h:number};spriteSourceSize:{x:number;y:number}};
type Master=Record<string,unknown>;
const cache=new Map<string,Promise<string[]|null>>();
async function json<T>(url:string):Promise<T>{const r=await fetch(url);if(!r.ok)throw Error('missing asset');return await r.json() as T;}
let masterPromise:Promise<Master>|null=null;
export function variantFrames(key:string,variant:number,facing:'front'|'back'):Promise<string[]|null>{
 if(!/^(?:female\/)?[0-9]+(?:-[a-z0-9-]+)?$/i.test(key)||![1,2].includes(variant))return Promise.resolve(null);
 const cacheKey=`${key}:${variant}:${facing}`,previous=cache.get(cacheKey);if(previous)return previous;
 const task=(async()=>{try{
  const local=reviewedAtlasRoot(key),localKind=reviewedAtlasVariant(key,variant,facing);
  const master=local?null:await (masterPromise ||= json<Master>(`${root}/variant/_masterlist.json`).catch(error=>{masterPromise=null;throw error;}));
  const section=(facing==='back'?master?.back:master) as Record<string,number[]>|undefined,kind=local?localKind:section?.[key]?.[variant];if(kind!==1&&kind!==2)return null;
  const assetRoot=local||root,folder=facing==='back'?'back/':'',base=kind===2?`${assetRoot}/variant/${folder}${key}_${variant+1}`:`${assetRoot}/${folder}${key}`;
  const [atlas,palette]=await Promise.all([json<{textures:{frames:Frame[]}[]}>(`${base}.json`),kind===1?json<Record<string,Record<string,string>>>(`${assetRoot}/variant/${folder}${key}.json`):Promise.resolve(null)]);
  const ordered=(sourceAtlasFrames(atlas) as Frame[]).filter(f=>/^\d{4}\.png$/.test(f.filename)&&!f.rotated).sort((a,b)=>a.filename.localeCompare(b.filename));if(!ordered.length)return null;
  const image=new Image();image.crossOrigin='anonymous';image.src=`${base}.png`;await image.decode();
  const selected=ordered.filter((_,i)=>i%Math.max(1,Math.ceil(ordered.length/12))===0),result:string[]=[];
  for(const f of selected){const canvas=document.createElement('canvas');canvas.width=f.sourceSize.w;canvas.height=f.sourceSize.h;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;const p=f.frame,o=f.spriteSourceSize;ctx.drawImage(image,p.x,p.y,p.w,p.h,o.x,o.y,p.w,p.h);
   if(palette){const colors=palette[String(variant)];if(!colors)return null;const data=ctx.getImageData(0,0,canvas.width,canvas.height),pixels=data.data;for(let i=0;i<pixels.length;i+=4){if(!pixels[i+3])continue;const rgb=[pixels[i],pixels[i+1],pixels[i+2]].map(n=>n.toString(16).padStart(2,'0')).join(''),color=colors[rgb];if(color){pixels[i]=parseInt(color.slice(0,2),16);pixels[i+1]=parseInt(color.slice(2,4),16);pixels[i+2]=parseInt(color.slice(4,6),16);}}ctx.putImageData(data,0,0);}
   result.push(canvas.toDataURL('image/png'));
  }return result;
 }catch{return null;}})();if(cache.size>=96){const oldest=cache.keys().next().value;if(oldest)cache.delete(oldest);}cache.set(cacheKey,task);void task.then(result=>{if(!result&&cache.get(cacheKey)===task)cache.delete(cacheKey);});return task;
}

// Exact base/shiny sprites for the reviewed PokéRogue form atlases.
const formCache=new Map<string,Promise<string[]|null>>();
export function sourceFormFrames(key:string,shiny:boolean,facing:'front'|'back'):Promise<string[]|null>{
 if(!reviewedAtlasRoot(key)&&!/^(855|869|869-(ruby-cream|matcha-cream|mint-cream|lemon-cream|salted-cream|ruby-swirl|caramel-swirl|rainbow-swirl))$/.test(key))return Promise.resolve(null);
 const cacheKey=`${key}:${shiny}:${facing}`,prior=formCache.get(cacheKey);if(prior)return prior;
 const task=(async()=>{try{
  const base=`${reviewedAtlasRoot(key)||root}/${facing==='back'?'back/':''}${shiny?'shiny/':''}${key}`;
  const atlas=await json<{textures:{frames:Frame[]}[]}>(`${base}.json`),ordered=(sourceAtlasFrames(atlas) as Frame[]).filter(f=>/^\d{4}\.png$/.test(f.filename)&&!f.rotated).sort((a,b)=>a.filename.localeCompare(b.filename));if(!ordered.length)return null;
  const image=new Image();image.crossOrigin='anonymous';image.src=`${base}.png`;await image.decode();const selected=ordered.filter((_,i)=>i%Math.max(1,Math.ceil(ordered.length/12))===0),result:string[]=[];
  for(const f of selected){const canvas=document.createElement('canvas');canvas.width=f.sourceSize.w;canvas.height=f.sourceSize.h;const ctx=canvas.getContext('2d');if(!ctx)return null;const p=f.frame,o=f.spriteSourceSize;ctx.drawImage(image,p.x,p.y,p.w,p.h,o.x,o.y,p.w,p.h);result.push(canvas.toDataURL('image/png'));}return result;
 }catch{return null;}})();if(formCache.size>=96){const oldest=formCache.keys().next().value;if(oldest)formCache.delete(oldest);}formCache.set(cacheKey,task);void task.then(result=>{if(!result&&formCache.get(cacheKey)===task)formCache.delete(cacheKey);});return task;
}
