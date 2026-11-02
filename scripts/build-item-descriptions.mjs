import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Dex} from '@pkmn/sim';

// Keep aligned with the imported game dataset. Do not silently move this to master.
// PokéAPI redistribution notice is retained in public/licenses/pokeapi.txt.
// Missing Korean source descriptions are deliberately omitted, never invented.
const revision='6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce';
const root=fileURLToPath(new URL('../',import.meta.url));
const cache=path.join(root,'.sites-runtime',`pokeapi-item-descriptions-${revision}`);
const source=`https://raw.githubusercontent.com/PokeAPI/pokeapi/${revision}/data/v2/csv/`;

// Same quoted-field/newline parser as import-pokedex.mjs, kept local because importing
// that executable script would update unrelated generated files and fetch master.
function csv(text){let rows=[],row=[],value='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(q&&text[i+1]==='"'){value+='"';i++}else q=!q}else if(c===','&&!q){row.push(value);value=''}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);value='';if(row.some(Boolean))rows.push(row);row=[]}else value+=c}if(value||row.length){row.push(value);rows.push(row)}const keys=rows.shift();return rows.map(r=>Object.fromEntries(keys.map((k,i)=>[k,r[i]||''])))}
async function load(name){const file=path.join(cache,`${name}.csv`);let text;try{text=await fs.readFile(file,'utf8')}catch(e){if(e.code!=='ENOENT')throw e;if(process.argv.includes('--cache-only'))throw Error(`Missing pinned cache: ${name}`);const r=await fetch(`${source}${name}.csv`);if(!r.ok)throw Error(`${name}: HTTP ${r.status}`);text=await r.text();if(/^\s*</.test(text))throw Error(`${name}: unexpected HTML response`);await fs.mkdir(cache,{recursive:true});await fs.writeFile(file,text);}return csv(text)}
const files=['items','item_names','item_flavor_text','item_prose'];
const [items,names,flavors,prose]=await Promise.all(files.map(load));
const byId=new Map(items.map(item=>[item.id,item]));
const koNames=new Map(names.filter(r=>r.local_language_id==='3').map(r=>[r.item_id,r.name]));
const normalize=identifier=>{const basic=identifier.replace(/--(?:held|bag)$/,'').toLowerCase().replace(/[^a-z0-9]/g,'');const canonical=Dex.items.get(basic);return canonical.exists?canonical.id:basic};
const tidy=text=>String(text||'').replace(/[\s\u000c]+/gu,' ').trim();
const latestByItem=new Map();
let koreanFlavorRows=0;
for(const row of flavors){if((row.language_id||row.local_language_id)!=='3')continue;const description=tidy(row.flavor_text);if(!description)continue;koreanFlavorRows++;const version=Number(row.version_group_id)||0,old=latestByItem.get(row.item_id);if(!old||version>old.version)latestByItem.set(row.item_id,{description,version,source:'flavor'});}
let koreanProseRows=0;
for(const row of prose){if((row.local_language_id||row.language_id)!=='3')continue;const description=tidy(row.short_effect||row.effect);if(!description)continue;koreanProseRows++;if(!latestByItem.has(row.item_id))latestByItem.set(row.item_id,{description,version:-1,source:'prose'});}
const selected=new Map();
for(const [id,value]of latestByItem){const item=byId.get(id);if(!item)throw Error(`Missing item identifier ${id}`);const key=normalize(item.identifier),old=selected.get(key),variantPriority=/--held$/.test(item.identifier)?2:/--bag$/.test(item.identifier)?0:1;
 // Held/bag Z-crystal rows describe different uses of one Showdown item. Prefer
 // the held description at an equal version, retaining latest-version priority.
 if(!old||value.version>old.version||value.version===old.version&&variantPriority>old.variantPriority)selected.set(key,{...value,variantPriority,itemId:id});
}
const descriptions=Object.fromEntries([...selected].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,value])=>[key,value.description]));
for(const [key,text]of Object.entries(descriptions)){if(!/^[a-z0-9]+$/.test(key)||!text||/[\r\n\f]/.test(text))throw Error(`Invalid generated description ${key}`);}
await fs.writeFile(path.join(root,'data/item-descriptions.json'),JSON.stringify(descriptions,null,2)+'\n');
console.log(JSON.stringify({revision,koreanFlavorRows,koreanProseRows,itemsWithKoreanDescriptions:latestByItem.size,normalizedDescriptions:Object.keys(descriptions).length,examples:['potion','superpotion','hyperpotion','maxpotion','fullrestore','antidote','pokeball','ultraball','masterball','leftovers','focussash','lifeorb','choiceband'].map(id=>({id,name:koNames.get(selected.get(id)?.itemId),description:descriptions[id]||null,version:selected.get(id)?.version??null}))},null,2));
