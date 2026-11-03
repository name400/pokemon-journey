/**
 * Public trainer asset manifest/cache. No game/API/auth data is changed.
 * Reads the official Showdown directory; never invents an unavailable filename.
 * PNGs are copied unchanged. Per-asset credits and use conditions are retained.
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const dataFile = new URL('data/rogue-trainer-appearance.json', root);
const worldFile = new URL('data/rogue-world-reference.json', root);
const assetDir = new URL('public/game/trainers/', root);
const directoryURL = 'https://play.pokemonshowdown.com/sprites/trainers/';
const compact = text => String(text).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const args = new Set(process.argv.slice(2));
const world = JSON.parse(readFileSync(worldFile));

// Explicit canon-class aliases, not a fallback to an unrelated trainer face.
const aliases = {
  BREEDER:'pokemonbreeder', RANGER:'pokemonranger', SNOW_ACE_TRAINER:'acetrainersnow',
  SNOW_WORKER:'workerice', AETHER_GRUNT:'aetheremployee',
  ROCKET_BOSS_GIOVANNI_1:'giovanni', ROCKET_BOSS_GIOVANNI_2:'giovanni',
  PENNY:'penny', PENNY_2:'penny',
};
// These source identities are not established by a same-name directory key.
// E.g. a source-specific Victor cannot be assumed to be Galar's protagonist.
// A generic class portrait is not evidence for a named character's appearance.
const custom = new Set(['UNKNOWN','VICTOR','VICTORIA','VIVI','VICKY','VITO','BUG_TYPE_SUPERFAN',
  'EXPERT_POKEMON_BREEDER','PLAYER_M_ALTERNATE','PLAYER_F_ALTERNATE',
  'RIVAL','RIVAL_2','RIVAL_3','RIVAL_4','RIVAL_5','RIVAL_6']);

if (args.has('--verify')) {
  const manifest = JSON.parse(readFileSync(dataFile));
  const failures=[];
  for (const [key, a] of Object.entries(manifest.assets)) {
    const file = new URL(`public${a.localUrl}`, root);
    if (!existsSync(file)) { failures.push(`${key}:missing`); continue; }
    const bytes = readFileSync(file);
    if (hash(bytes)!==a.sha256 || bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a') failures.push(`${key}:invalid`);
  }
  if (Object.keys(manifest.byEnumName).length!==Object.keys(world.trainerConfigs).length) failures.push('source trainer count mismatch');
  for(const record of Object.values(manifest.byEnumName))for(const variant of Object.values(record.variants||{})) {
    if(variant?.spriteKey&&!manifest.assets[variant.spriteKey])failures.push(`${record.enumName}:missing asset ${variant.spriteKey}`);
  }
  console.log(JSON.stringify({assets:Object.keys(manifest.assets).length,trainers:Object.keys(manifest.byEnumName).length,failures}));
  if(failures.length)process.exitCode=1;
} else {
  await build();
}

async function get(url) {
  let last;
  for(let attempt=0;attempt<3;attempt++) {
    try {return await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'PokeJourney-asset-verifier/1.0'}});}
    catch(error) {last=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));}
  }
  throw last;
}
function category(config) {
  const calls=new Set(config.sourceCalls.map(c=>c.method));
  return calls.has('initForGymLeader')?'gym':calls.has('initForEliteFour')?'eliteFour':calls.has('initForChampion')?'champion':
    calls.has('initForEvilTeamAdmin')?'evilAdmin':calls.has('initForEvilTeamLeader')?'evilLeader':'trainer';
}
function indexedVariants(keys, name) {
  return [...keys].filter(k=>k===name||k.startsWith(name+'-'));
}
function choose(keys, name) {
  if(keys.has(name))return {key:name,rule:'exact-directory-identity'};
  const all=indexedVariants(keys,name);
  // Same exact identity with a stated generation suffix. Do not fuzzy-match.
  for(const suffix of ['-gen4','-gen3','-gen2','-gen1','-gen6','-gen7','-gen8','-gen9','-gen3champion','-gen5bw2','-s','-v'])
    if(keys.has(name+suffix))return {key:name+suffix,rule:['-s','-v'].includes(suffix)?'same-identity-stated-game-version-variant':'same-identity-generation-variant'};
  if(all.length===1)return {key:all[0],rule:'only-listed-same-identity-variant'};
  return null;
}
function resolve(config, keys) {
  const name=config.enumName, methods=config.sourceCalls;
  if(custom.has(name))return {status:'unmatched',reason:'Source-specific identity: no verified matching Showdown portrait; same-name characters are not assumed equivalent',variants:{male:null,female:null,double:null}};
  const roleBase=name.replace(/_(?:ELITE|CHAMPION)$/,'').replace(/_2$/,'');
  const declaredName=methods.find(c=>c.method==='setName'&&typeof c.args[0]==='string')?.args[0];
  let canonical=aliases[name]||compact(declaredName||roleBase);
  // Explicit champion costume exists and its directory name states the role.
  if(name==='BLUE'&&keys.has('blue-gen3champion'))canonical='blue-gen3champion';
  if(name==='IRIS'&&keys.has('iris-gen5bw2'))canonical='iris-gen5bw2';
  const selected=choose(keys,canonical);
  const gender=methods.find(c=>c.method==='setHasGenders');
  let female=null;
  if(gender) {
    const explicit=typeof gender.args[1]==='string'?gender.args[1]:typeof gender.args[0]==='string'?gender.args[0]:null;
    female=choose(keys,explicit?compact(explicit):canonical+'f');
  }
  const double=methods.find(c=>c.method==='setHasDouble'||c.method==='setDoubleOnly');
  const doubleName=typeof double?.args[0]==='string'?compact(double.args[0]):null;
  const pair=doubleName?choose(keys,doubleName):null;
  return {status:selected?'matched':'unmatched',reason:selected?null:`No exact directory identity for ${canonical}`,
    canonicalIdentity:canonical,declaredName:declaredName||null,
    matchRule:selected?(aliases[name]?'explicit-canonical-class-or-role-alias':roleBase!==name?'same-person-role-alias':selected.rule):null,
    variants:{male:selected,female,double:pair},
    variantLimitations:[...(gender&&!female?['Female counterpart is not verified']:[]),...(double&&!pair?['Double-trainer portrait is not verified']:[])],
  };
}
async function build() {
  const response=await get(directoryURL);
  if(!response.ok)throw Error(`Directory HTTP ${response.status}`);
  const html=await response.text(), entries=new Map();
  for(const figure of html.matchAll(/<figure id="([a-z0-9-]+)\.png">([\s\S]*?)<\/figure>/g)) {
    const artist=figure[2].match(/<br\s*\/>by\s+([\s\S]*?)<\/figcaption>/)?.[1]?.replace(/<[^>]+>/g,'').replaceAll('&amp;','&').trim()||null;
    entries.set(figure[1],{artist});
  }
  if(entries.size<1000)throw Error('Unexpected official directory format; refuse guessed mappings');
  const keys=new Set(entries.keys()), records=Object.entries(world.trainerConfigs).map(([id,c])=>({id:Number(id),enumName:c.enumName,category:category(c),...resolve(c,keys)}));
  if(args.has('--inspect')) {
    const unmatched=records.filter(r=>r.status!=='matched').map(r=>({name:r.enumName,reason:r.reason,
      candidates:[...keys].filter(k=>k.includes(compact(r.enumName).slice(0,6))).slice(0,12)}));
    console.log(JSON.stringify({directoryCount:keys.size,matched:records.length-unmatched.length,unmatched},null,2));
    return;
  }
  mkdirSync(assetDir,{recursive:true});
  const wanted=[...new Set(records.flatMap(r=>Object.values(r.variants).filter(Boolean).map(v=>v.key)))];
  const assets={},errors=[];
  let completed=0,index=0;
  await Promise.all(Array.from({length:6},async()=>{
    while(index<wanted.length){
      const key=wanted[index++],url=directoryURL+key+'.png';
      try {
        const r=await get(url),bytes=Buffer.from(await r.arrayBuffer()),contentType=r.headers.get('content-type');
        if(r.status!==200||!contentType?.startsWith('image/png')||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error(`HTTP ${r.status}, ${contentType}, invalid PNG=${bytes.subarray(0,8).toString('hex')}`);
        const localUrl=`/game/trainers/${key}.png`;
        writeFileSync(new URL(key+'.png',assetDir),bytes);
        assets[key]={spriteKey:key,localUrl,sourceUrl:url,sourceDirectory:directoryURL,artist:entries.get(key).artist,
          sha256:hash(bytes),bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),
          verification:{method:'GET',status:r.status,contentType,checkedAt:new Date().toISOString()}};
      }catch(error){errors.push({key,url,error:String(error)});}
      completed++;
      if(completed%50===0)console.log(`Verified ${completed}/${wanted.length} trainer PNGs`);
    }
  }));
  const byEnumName={},byTrainerType={};
  for(const record of records){
    const variants={};
    for(const [kind,v]of Object.entries(record.variants))variants[kind]=v&&assets[v.key]?{spriteKey:v.key,src:assets[v.key].localUrl,sourceUrl:assets[v.key].sourceUrl,matchRule:v.rule}:null;
    const primary=variants.male;
    variants.default=primary;
    delete variants.male;
    byEnumName[record.enumName]={sourceType:record.id,enumName:record.enumName,category:record.category,
      status:primary?'matched':'unmatched',spriteKey:primary?.spriteKey||null,src:primary?.src||null,sourceUrl:primary?.sourceUrl||null,
      matchRule:record.matchRule,canonicalIdentity:record.canonicalIdentity||null,reason:primary?null:record.reason||'Image HTTP verification failed',
      variants,variantLimitations:record.variantLimitations||[]};
    byTrainerType[record.id]=record.enumName;
  }
  const unmatched=Object.values(byEnumName).filter(r=>r.status!=='matched').map(r=>({sourceType:r.sourceType,enumName:r.enumName,category:r.category,reason:r.reason}));
  const counts={sourceTrainers:records.length,mapped:records.length-unmatched.length,unmatched:unmatched.length,localAssets:Object.keys(assets).length,
    gym:records.filter(r=>r.category==='gym').length,eliteFour:records.filter(r=>r.category==='eliteFour').length,champion:records.filter(r=>r.category==='champion').length,
    unmatchedPriority:unmatched.filter(r=>['gym','eliteFour','champion'].includes(r.category)).length,httpFailures:errors.length};
  const manifest={metadata:{version:1,generatedAt:new Date().toISOString(),sourceVersion:world.metadata.version,sourceCommit:world.metadata.upstreamCommit,
    directory:{url:directoryURL,status:response.status,sha256:hash(html),listedPngCount:entries.size},counts,
    useConditions:{notice:'Many sprites are not from the games. Credit the appropriate artist; do not edit without permission.',
      source:directoryURL,artistCreditField:'assets[spriteKey].artist',uncreditedMeaning:'No artist caption was listed; this is not a public-domain assertion',
      pokemonRights:'Pokémon characters and trademarks remain with their respective rights holders; no blanket permissive artwork license is asserted',
      localFiles:'Byte-for-byte unchanged copies; no cropping, recoloring, resizing or sprite edits performed'},
    selectionPolicy:'Only exact directory identities, explicit canonical class names, or documented same-person role aliases; no fuzzy identity matching',
    fallbackPolicy:'Unmatched src is null. UI must use a clearly generic fallback rather than claiming another person is this trainer',
    variantDefinitions:{default:'Default appearance; does not imply male gender for named characters',female:'Explicit source-configured gender counterpart when available',double:'Verified double-trainer class portrait only'}},
    byEnumName,byTrainerType,assets:Object.fromEntries(Object.entries(assets).sort(([a],[b])=>a.localeCompare(b))),unmatched,httpFailures:errors};
  writeFileSync(dataFile,JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({output:fileURLToPath(dataFile),counts,unmatched,errors},null,2));
  if(errors.length)process.exitCode=1;
}
