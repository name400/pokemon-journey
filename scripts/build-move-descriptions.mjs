import fs from 'node:fs/promises';
import path from 'node:path';
const revision='6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce';
const root=new URL('../',import.meta.url),cache=new URL(`../.sites-runtime/pokeapi-move-descriptions-${revision}/`,import.meta.url);
function csv(text){let rows=[],row=[],value='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(q&&text[i+1]==='"'){value+='"';i++;}else q=!q;}else if(c===','&&!q){row.push(value);value='';}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);value='';if(row.some(Boolean))rows.push(row);row=[];}else value+=c;}if(value||row.length){row.push(value);rows.push(row);}const keys=rows.shift();return rows.map(r=>Object.fromEntries(keys.map((k,i)=>[k,r[i]||''])));}
async function load(name){const file=new URL(name+'.csv',cache);let text;try{text=await fs.readFile(file,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;const response=await fetch(`https://raw.githubusercontent.com/PokeAPI/pokeapi/${revision}/data/v2/csv/${name}.csv`);if(!response.ok)throw Error(name+': '+response.status);text=await response.text();await fs.mkdir(cache,{recursive:true});await fs.writeFile(file,text);}return csv(text);}
const [moves,flavors]=await Promise.all([load('moves'),load('move_flavor_text')]),ids=new Map(moves.map(m=>[m.id,m.identifier.replaceAll('-','')])),selected=new Map();
for(const row of flavors){if(row.language_id!=='3')continue;const key=ids.get(row.move_id),version=Number(row.version_group_id),text=row.flavor_text.replace(/[\s\f]+/gu,' ').trim();if(key&&text&&(!selected.has(key)||selected.get(key).version<version))selected.set(key,{version,text});}
await fs.writeFile(new URL('data/move-descriptions.json',root),JSON.stringify(Object.fromEntries([...selected].map(([id,v])=>[id,v.text])),null,2)+'\n');
console.log(JSON.stringify({source:revision,koreanDescriptions:selected.size,examples:['tackle','growl','flamethrower','terablast'].map(id=>[id,selected.get(id)?.text])}));
