import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Dex} from '@pkmn/sim';

// Independent crosswalk of static facts. This does not import or execute PokéRogue
// code, initialize registries, change app data, or download any artwork.
const POKEAPI_REVISION='6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce';
const SOURCE_REVISION='29441f7aa7482d9e816b253d324293788936dc3e';
const SPRITE_REVISION='d98f9e5b35e23500bdffdd1237d5482bdee9be49';
const MODEL_TREE='48b1b358899dd3733e551cb8553b2a5216b8ecfa';
const GEN5_TREE='efe5bad08c450e853fde5b965133bd79fcb8e7ab';
const root=fileURLToPath(new URL('../',import.meta.url));
const cache=path.join(root,'.sites-runtime',`rogue-form-appearance-pokeapi-${POKEAPI_REVISION}`);
const output=path.join(root,'data/rogue-form-appearance.json');
const cacheOnly=process.argv.includes('--cache-only');
const check=process.argv.includes('--check');
const compact=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');

function csv(text){
 const rows=[];let row=[],value='',quoted=false;
 for(let index=0;index<text.length;index++){
  const char=text[index];
  if(char==='"'){if(quoted&&text[index+1]==='"'){value+='"';index++;}else quoted=!quoted;}
  else if(char===','&&!quoted){row.push(value);value='';}
  else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[index+1]==='\n')index++;row.push(value);if(row.some(Boolean))rows.push(row);row=[];value='';}
  else value+=char;
 }
 if(value||row.length){row.push(value);rows.push(row);}
 if(quoted)throw Error('Unterminated quoted CSV field');
 const headings=rows.shift();if(!headings?.includes('form_identifier'))throw Error('Unexpected pokemon_forms.csv headings');
 return rows.map(row=>Object.fromEntries(headings.map((key,index)=>[key,row[index]||''])));
}
async function fetchText(url){const response=await fetch(url,{headers:{'User-Agent':'PokeJourney-form-appearance-crosswalk'},signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`${url}: HTTP ${response.status}`);return response.text();}
async function cached(name,download){const file=path.join(cache,name);try{return await fs.readFile(file,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;if(cacheOnly)throw Error(`Pinned cache is missing: ${file}`);const text=await download();await fs.mkdir(cache,{recursive:true});await fs.writeFile(file,text);return text;}}
const formText=await cached('pokemon_forms.csv',()=>fetchText(`https://raw.githubusercontent.com/PokeAPI/pokeapi/${POKEAPI_REVISION}/data/v2/csv/pokemon_forms.csv`));
const inventoryText=await cached('showdown-sprite-inventory.json',async()=>{
 const tree=async sha=>{const data=JSON.parse(await fetchText(`https://api.github.com/repos/smogon/sprites/git/trees/${sha}`));if(data.truncated)throw Error(`Truncated sprite tree: ${sha}`);return data.tree.filter(entry=>entry.type==='blob').map(({path,sha,size})=>({path,sha,size}));};
 const [models,gen5]=await Promise.all([tree(MODEL_TREE),tree(GEN5_TREE)]);
 return JSON.stringify({repository:'smogon/sprites',commit:SPRITE_REVISION,grammar:'src/README.md; data/lib/index.ts publishedName(..., psid)',modelTreeSha:MODEL_TREE,gen5TreeSha:GEN5_TREE,models,gen5});
});
const [referenceText,pokedexText,pokedexSourceText]=await Promise.all(['rogue-reference.json','pokedex.json','pokedex-source.json'].map(name=>fs.readFile(path.join(root,'data',name),'utf8')));
const reference=JSON.parse(referenceText),pokedex=JSON.parse(pokedexText),pokedexSource=JSON.parse(pokedexSourceText),inventory=JSON.parse(inventoryText);
if(reference.metadata.version!=='1.12.2.3'||reference.metadata.upstreamCommit!==SOURCE_REVISION)throw Error('PokéRogue source revision changed; audit aliases before rebuilding.');
if(pokedexSource.revision!==POKEAPI_REVISION)throw Error('The app Pokédex is not from the pinned PokéAPI revision.');
if(inventory.commit!==SPRITE_REVISION||inventory.modelTreeSha!==MODEL_TREE||inventory.gen5TreeSha!==GEN5_TREE)throw Error('Unexpected sprite-inventory revision.');
const apiForms=csv(formText),appByFormId=new Map(pokedex.map(mon=>[mon.formId,mon]));

// Format facts from the pinned Smogon sprite repository's src/README.md and
// data/lib/index.ts: s<species>[-o<form>][-b][-s][-f]; underscores are removed
// in Pokémon Showdown names. This parser is written here, not imported upstream.
function spriteRecord(entry,set){
 const extension=path.extname(entry.path).slice(1),stem=path.basename(entry.path,`.${extension}`);
 if(!['gif','png'].includes(extension)||!stem.startsWith('s'))return null;
 const [name,...flags]=stem.slice(1).split('-');if(!name)return null;
 const form=flags.find(flag=>flag.startsWith('o'))?.slice(1)||'';
 const key=name.replaceAll('_','')+(form?'-'+form.replaceAll('_',''):'')+(flags.includes('f')?'-f':'')+(flags.includes('g')?'-gmax':'');
 return {key,back:flags.includes('b'),shiny:flags.includes('s'),set,path:`src/${set==='models'?'models':'sprites/gen5'}/${entry.path}`,sha:entry.sha,extension,size:entry.size};
}
const sprites=new Map();
for(const [set,entries]of [['models',inventory.models],['gen5',inventory.gen5]])for(const entry of entries){const item=spriteRecord(entry,set);if(!item)continue;if(!sprites.has(item.key))sprites.set(item.key,[]);sprites.get(item.key).push(item);}
function availableSprites(key){
 const entries=sprites.get(key)||[],result={};
 for(const [name,back,shiny]of [['front',false,false],['back',true,false],['shinyFront',false,true],['shinyBack',true,true]]){
  const candidates=entries.filter(entry=>entry.back===back&&entry.shiny===shiny).sort((a,b)=>(a.set==='models'?0:1)-(b.set==='models'?0:1)||(a.extension==='gif'?0:1)-(b.extension==='gif'?0:1)||a.path.localeCompare(b.path));
  if(candidates[0]){const {path,sha,extension,set}=candidates[0];result[name]={path,sha,extension,set};}
 }return result;
}

// Source labels are not PokéAPI labels. Every exception below is a named,
// independently checkable alias, never an "endsWith" or first-candidate guess.
const apiAliases={
 25:{partner:'starter','cool-cosplay':'rock-star','beauty-cosplay':'belle','cute-cosplay':'pop-star','smart-cosplay':'phd','tough-cosplay':'libre'},
 133:{partner:'starter'},172:{spiky:'spiky-eared'},676:{'':'natural'},710:{'':'average',jumbo:'super'},
 718:{'50-pc':'50-power-construct','10-pc':'10-power-construct'},741:{pompom:'pom-pom'},
 888:{'hero-of-many-battles':''},889:{'hero-of-many-battles':''},1017:{'teal-mask':''},
 8128:{combat:'paldea-combat-breed',blaze:'paldea-blaze-breed',aqua:'paldea-aqua-breed'},
};
const sourceFamilies={2658:658,2670:670,8128:128};
const exactSpecialIdentifiers={2658:'greninja-battle-bond',2670:'floette-eternal'};
const nativeAliases={
 'greninja-battle-bond':'greninjabond','rockruff-own-tempo':'rockruffdusk',
 'zygarde-10-power-construct':'zygarde10','zygarde-50-power-construct':'zygarde',
 'indeedee-female':'indeedeef','indeedee-male':'indeedee',
 'tauros-paldea-combat-breed':'taurospaldeacombat','tauros-paldea-blaze-breed':'taurospaldeablaze','tauros-paldea-aqua-breed':'taurospaldeaaqua',
 'squawkabilly-green-plumage':'squawkabilly','squawkabilly-blue-plumage':'squawkabillyblue','squawkabilly-yellow-plumage':'squawkabillyyellow','squawkabilly-white-plumage':'squawkabillywhite',
 'minior-red':'minior','minior-red-meteor':'miniormeteor',
 'minior-orange-meteor':'miniormeteor','minior-yellow-meteor':'miniormeteor','minior-green-meteor':'miniormeteor','minior-blue-meteor':'miniormeteor','minior-indigo-meteor':'miniormeteor','minior-violet-meteor':'miniormeteor',
};
const spriteAliases={
 'unown-a':'unown','burmy-plant':'burmy','shellos-west':'shellos','deerling-spring':'deerling','flabebe-red':'flabebe','furfrou-natural':'furfrou',
 'basculin-red-striped':'basculin','pumpkaboo-average':'pumpkaboo',
 'zygarde-50':'zygarde','zygarde-50-power-construct':'zygarde','zygarde-10-power-construct':'zygarde-10',
 'oricorio-baile':'oricorio','rockruff-own-tempo':'rockruff',
 'minior-red-meteor':'minior-meteor','minior-orange-meteor':'minior-meteor','minior-yellow-meteor':'minior-meteor','minior-green-meteor':'minior-meteor','minior-blue-meteor':'minior-meteor','minior-indigo-meteor':'minior-meteor','minior-violet-meteor':'minior-meteor','minior-red':'minior',
 'sinistea-phony':'sinistea','indeedee-male':'indeedee','indeedee-female':'indeedee-f',
 'squawkabilly-green-plumage':'squawkabilly','squawkabilly-blue-plumage':'squawkabilly-blue','squawkabilly-yellow-plumage':'squawkabilly-yellow','squawkabilly-white-plumage':'squawkabilly-white',
 'tatsugiri-curly':'tatsugiri','gimmighoul-chest':'gimmighoul','poltchageist-counterfeit':'poltchageist',
 'tauros-paldea-combat-breed':'tauros-paldeacombat','tauros-paldea-blaze-breed':'tauros-paldeablaze','tauros-paldea-aqua-breed':'tauros-paldeaaqua',
 'greninja-battle-bond':'greninja',
};
const omissions=[],rows=[];
for(const source of Object.values(reference.species).filter(source=>source.isStarter)){
 const familyId=sourceFamilies[source.sourceId]||source.sourceId;
 const familyForms=apiForms.filter(form=>appByFormId.get(Number(form.id))?.speciesId===familyId);
 for(const form of (source.forms||[]).filter(form=>form.formIndex===0||(form.isStarterSelectable??!form.formKey))){
  const sourceKey=form.formKey||'',apiKey=apiAliases[source.sourceId]?.[sourceKey]??sourceKey;
  let candidates;
  if(exactSpecialIdentifiers[source.sourceId])candidates=familyForms.filter(row=>row.identifier===exactSpecialIdentifiers[source.sourceId]);
  else if(sourceKey||Object.hasOwn(apiAliases[source.sourceId]||{},sourceKey))candidates=familyForms.filter(row=>row.form_identifier===apiKey);
  else candidates=familyForms.filter(row=>Number(row.pokemon_id)===familyId&&row.is_default==='1');
  const api=candidates.length===1?candidates[0]:null,mon=api?appByFormId.get(Number(api.id)):null;
  const row={sourceId:source.sourceId,formIndex:form.formIndex,sourceFormKey:sourceKey,sourceSpriteKey:form.formSpriteKey??null,sourceFormName:form.formName||'',pokemonId:mon?.id??null,formId:api?Number(api.id):null,pokeapiFormKey:api?.form_identifier??null,pokeapiIdentifier:api?.identifier??null,artId:mon?.artId??null,spriteKey:null,appearanceSameAsBase:null};
  if(!api||!mon){omissions.push({sourceId:source.sourceId,formIndex:form.formIndex,field:'pokemonId',reason:candidates.length?`Ambiguous exact CSV matches: ${candidates.map(row=>row.id).join(',')}`:`No exact form_identifier ${JSON.stringify(apiKey)} in pinned species ${familyId}`});rows.push(row);continue;}
  const nativeName=source.sourceId===664?'scatterbug':nativeAliases[api.identifier]||api.identifier;
  let native=Dex.species.get(nativeName);
  if(!native.exists&&form.formIndex===0)native=Dex.species.get(source.enumName.toLowerCase().replaceAll('_','-'));
  if(native.exists)row.nativeSpecies=native.id;
  else omissions.push({sourceId:source.sourceId,formIndex:form.formIndex,field:'nativeSpecies',reason:`No exact native species ${nativeName}`});
  let spriteKey;
  if(source.sourceId===664)spriteKey='scatterbug';
  else if(Object.hasOwn(spriteAliases,api.identifier))spriteKey=spriteAliases[api.identifier];
  else if(form.formIndex>0){const baseName=source.enumName.toLowerCase().replaceAll('_','');spriteKey=baseName+(api.form_identifier?'-'+compact(api.form_identifier):'');}
  else if(native.exists)spriteKey=native.spriteid;
  if(spriteKey&&availableSprites(spriteKey).front){row.spriteKey=spriteKey;row.spriteFiles=availableSprites(spriteKey);}
  else omissions.push({sourceId:source.sourceId,formIndex:form.formIndex,field:'spriteKey',reason:`No verified front sprite for exact key ${spriteKey||'(unresolved)'}`});
  if(sourceKey!==api.form_identifier)row.alias={source:sourceKey,pokeapi:api.form_identifier,reason:source.sourceId===8128?'Regional source species uses a PokéAPI breed form.':source.sourceId===25?'Source contest/partner label differs from the PokéAPI form label.':'Explicit source-to-PokéAPI form-label alias.'};
  if(source.sourceId===664){row.evolutionFormKey=sourceKey;row.note='Scatterbug pattern identities have the same appearance. Keep formIndex/form key: the evolved Vivillon patterns differ.';}
  if(source.sourceId===1012&&sourceKey==='artisan')row.note='Source formSpriteKey explicitly borrows counterfeit. Smogon artisan/base assets are compared below; the PokéAPI artisan identity remains distinct.';
  rows.push(row);
 }
}
for(const row of rows){
 const base=rows.find(base=>base.sourceId===row.sourceId&&base.formIndex===0);
 if(!row.spriteKey||!base?.spriteKey)continue;
 const hashesMatch=row.spriteFiles?.front?.sha===base.spriteFiles?.front?.sha&&row.spriteFiles?.back?.sha===base.spriteFiles?.back?.sha&&!!row.spriteFiles?.back;
 row.appearanceSameAsBase=row.spriteKey===base.spriteKey||hashesMatch;
 row.sameAppearanceEvidence=row.spriteKey===base.spriteKey?'same-verified-sprite-key':hashesMatch?'identical-front-and-back-source-blobs':'distinct-verified-sprite-assets';
}
const nonBase=rows.filter(row=>row.formIndex>0);
if(rows.length!==202||nonBase.length!==117)throw Error(`Pinned selectable-form count changed: ${rows.length} explicit / ${nonBase.length} non-base`);
const result={metadata:{schemaVersion:1,scope:'All explicitly declared selectable starter forms, including formIndex 0. 117 non-base rows are the requested missing-form audit scope.',source:{repository:reference.metadata.upstreamRepository,version:reference.metadata.version,revision:SOURCE_REVISION},pokeapi:{repository:'PokeAPI/pokeapi',revision:POKEAPI_REVISION,file:'data/v2/csv/pokemon_forms.csv',sha256:hash(formText)},sprites:{repository:'smogon/sprites',revision:SPRITE_REVISION,modelsTree:MODEL_TREE,gen5Tree:GEN5_TREE,verification:'Exact source filenames and non-empty blobs from pinned Git trees. No live CDN-response claim.',namingSources:['src/README.md','data/lib/index.ts'],spriteKeySemantics:'Pokémon Showdown published filename stem, with underscore word boundaries removed. Files record the exact official sprite source and blob hash.'},inputs:{referenceSha256:hash(referenceText),pokedexSha256:hash(pokedexText)},counts:{explicitSelectableForms:rows.length,nonBaseSelectableForms:nonBase.length,mappedPokemonIds:rows.filter(row=>row.pokemonId!==null).length,mappedNonBasePokemonIds:nonBase.filter(row=>row.pokemonId!==null).length,verifiedSpriteKeys:rows.filter(row=>row.spriteKey!==null).length,verifiedNonBaseSpriteKeys:nonBase.filter(row=>row.spriteKey!==null).length,omissions:omissions.length},semantics:{pokemonId:'Current application ID, joined by exact PokéAPI pokemon_form.id; never the source species ID or PokeAPI pokemon_id.',artId:'Existing application PokéAPI artId. Cosmetic forms can share this numeric ID while spriteKey differs.',nativeSpecies:'Existing @pkmn/sim species ID, where an explicit native counterpart exists. Not its often-collapsed cosmetic spriteid.',appearanceSameAsBase:'True for a shared verified sprite key, or identical verified front/back blobs, relative to source formIndex 0. False means distinct verified asset identities, not a claim about battle effects.',sourceSpriteKey:'The original explicit source override; null means no override. Empty string explicitly borrows the source base sprite.',unknown:'Unresolved values are null/omissions; no nearest-form or suffix-match guesses.'},notes:['Source formIndex 0 is not always the application default form: source Shellos East and Scatterbug Meadow are non-default PokéAPI forms.','Scatterbug form identities must remain distinct for later Vivillon appearance despite sharing Scatterbug images.','This file contains crosswalk facts only and does not implement form effects, battle stats, evolution, or artwork licensing.']},forms:rows,omissions};
const text=JSON.stringify(result,null,2)+'\n';
if(check){if(await fs.readFile(output,'utf8')!==text)throw Error('Generated form crosswalk is stale.');}else await fs.writeFile(output,text);
console.log(JSON.stringify({...result.metadata.counts,omissions,output:path.relative(root,output),mode:check?'check':'write'},null,2));
