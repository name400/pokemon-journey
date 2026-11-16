// Real adventure API against an isolated in-memory SQLite database.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
import {makeMon} from '../lib/game.mjs';
import {storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {prepareVerifiedWildMoves,applyAdventureLevelMoves,adventureLearnableMoves} from '../lib/cloud-adventure/adventure-growth.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),sql=new DatabaseSync(':memory:');
for(const name of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort())sql.exec(await fs.readFile(new URL('../drizzle/'+name,import.meta.url),'utf8'));
function prepare(query,args=[]){return {bind(...values){return prepare(query,values);},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){if(/^\s*SELECT\b/i.test(query))return {results:sql.prepare(query).all(...args),meta:{changes:0}};const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}};}};}
globalThis.__adventureEnv={DB:{prepare,async batch(statements){sql.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}}};
globalThis.__adventureUser={userId:'adventure-qa',displayName:'탐험테스트'};globalThis.__adventureRandom=()=>.999;
async function loadTS(relative){
 let source=await fs.readFile(new URL('../'+relative,import.meta.url),'utf8');
 source=source.replace(/import\s*\{\s*env\s*\}\s*from\s*['"]cloudflare:workers['"];?/g,'const env=globalThis.__adventureEnv;');
 source=source.replace(/import\s*\{getChatGPTUser\}\s*from\s*['"]@\/app\/chatgpt-auth['"];?/g,'const getChatGPTUser=async()=>globalThis.__adventureUser;');
 source=source.replace("const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;","const random=()=>globalThis.__adventureRandom();");
 source=source.replace("import {adventureClockOffset,restUntilHour,migrateAdventureWildClock,syncAdventureCombatClock,adventureGameTime as gameTime} from '@/lib/cloud-adventure/adventure-clock.mjs';","import {adventureClockOffset,restUntilHour,migrateAdventureWildClock,syncAdventureCombatClock,adventureGameTime as realGameTime} from '@/lib/cloud-adventure/adventure-clock.mjs';const gameTime=(now,offset=0)=>{const t=globalThis.__adventureTime;if(!t)return realGameTime(now,offset);offset=Math.round(offset);if(!offset)return t;const hour=((t.hour+offset)%24+24)%24;return {...t,...(Number.isSafeInteger(t.absoluteHour)?{absoluteHour:t.absoluteHour+offset}:{}),hour,period:hour>=4&&hour<20?'day':'night',dusk:hour>=16&&hour<20};};");
 const inventoryURL=relative==='lib/cloud-adventure/route.ts'?await loadTS('lib/inventory.ts'):null;
 const battleLockURL=relative==='app/api/trades/route.ts'?await loadTS('lib/battle-lock.ts'):null;
 source=source.replace(/from\s*(['"])(@\/[^'"]+|\.\.?\/[^'"]+)\1/g,(_,quote,specifier)=>{
  if(specifier==='@/lib/inventory')return `from '${inventoryURL}'`;
  if(specifier==='@/lib/battle-lock')return `from '${battleLockURL}'`;
  const url=specifier.startsWith('@/')?pathToFileURL(root+specifier.slice(2)):new URL(specifier,new URL('../'+relative,import.meta.url));return `from '${url.href}'`;
 });
 const emitted=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 return 'data:text/javascript;base64,'+Buffer.from(emitted).toString('base64');
}
const route=await import(await loadTS('lib/cloud-adventure/route.ts'));
let state;
async function get(){const r=await route.GET(new Request('http://adventure.test/api/world'));assert.equal(r.status,200);return state=await r.json();}
async function call(action,extra={},expected=200){const r=await route.POST(new Request('http://adventure.test/api/world',{method:'POST',headers:{'content-type':'application/json',origin:'http://adventure.test'},body:JSON.stringify({action,revision:state?.revision,...extra})}));const d=await r.json();assert.equal(r.status,expected,`${action}: ${JSON.stringify(d)}`);if(expected===200)state=d;return d;}
function rawWorld(){return JSON.parse(sql.prepare('SELECT state FROM worlds WHERE user_id=?').get(globalThis.__adventureUser.userId).state);}
function seedWorld(patch){const w={...rawWorld(),...patch};sql.prepare('UPDATE worlds SET state=?,revision=revision+1 WHERE user_id=?').run(JSON.stringify(w),globalThis.__adventureUser.userId);}
function rawMon(id){return JSON.parse(sql.prepare('SELECT data FROM pokemon_box WHERE id=?').get(id).data);}
function seedMon(id,p){sql.prepare('UPDATE pokemon_box SET species_id=?,data=? WHERE id=?').run(p.id,JSON.stringify(p),id);}

test('Zone 5 families and directly encountered evolutions preserve older individuals',()=>{
 for(const [id,level,expected,marker] of [[63,13,['순간이동'],'adventureZone9PsychicGrowthV1'],[309,17,['몸통박치기','전기쇼크','전기자석파','스파크'],'adventureElectrikeGrowthV1']]){const old=makeMon(id,level),snapshot=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,snapshot);assert.deepEqual(fresh.moves,expected);assert.equal(fresh[marker],true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true})[marker],undefined);const unknown={...old,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown),unknown);assert.equal(prepareVerifiedWildMoves({...old,formId:999})[marker],undefined);}
 for(const [id,level,flag] of [[17,19,'zone5Evolved'],[180,20,'zone6Evolved']]){const old=makeMon(id,level);assert.equal(prepareVerifiedWildMoves(old),old);assert.equal(prepareVerifiedWildMoves(old,{[flag]:true}).adventureZone1GrowthV1,true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},{[flag]:true}).adventureZone1GrowthV1,undefined);const unknown={...old,adventureZone1GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,{[flag]:true}),unknown);}
 const before={...makeMon(309,19),adventureElectrikeGrowthV1:true,moves:['몸통박치기','방어','돌진','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level:20},{});assert.deepEqual(out.pending,['물기']);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level:20},{}).includes('물기'));const evolved={...makeMon(310,40),adventureElectrikeGrowthV1:true};assert.ok(adventureLearnableMoves(evolved,{}).includes('불꽃엄니'));assert.deepEqual(adventureLearnableMoves({...makeMon(63,13),adventureZone9PsychicGrowthV1:true},{}),['순간이동']);
});

test('Zone 5 Abra and Electrike encounters preserve growth on capture and reload',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom,oldTime=globalThis.__adventureTime;globalThis.__adventureUser={userId:'zone5-roof-growth-qa',displayName:'구역 5 옥상 성장'};globalThis.__adventureTime={period:'day',hour:12};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs);const place=extra=>storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone5',interior:null,zaZone5Upper:true,zaRoyaleRank:'A',zaMission19Complete:true,zaZone5Spent:{},zaWildVisibleAlphaLevels:{},combat:null,encounter:null,...extra},state.revision+1);seedWorld(place({x:6,y:4,facing:'up',zaWildShinyRolls:{'zone5:abra:63':false},adventureBalls:{masterball:2}}));await get();await call('zone5Wild-abra');assert.equal(rawWorld().encounter.adventureZone9PsychicGrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['순간이동']);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const abra=state.box.find(m=>m.speciesId===63);assert.ok(abra);assert.equal(rawMon(abra.boxId).adventureZone9PsychicGrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});globalThis.__adventureRandom=()=>.999;seedWorld(place({x:7,y:4,facing:'up',zaWildShinyRolls:{'zone5:electrike:309':false}}));await get();await call('zone5Wild-electrike');assert.equal(rawWorld().encounter.adventureElectrikeGrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['몸통박치기','전기쇼크','전기자석파','스파크']);await get();globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const electrike=state.box.find(m=>m.speciesId===309);assert.ok(electrike);assert.equal(rawMon(electrike.boxId).adventureElectrikeGrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;globalThis.__adventureTime=oldTime;}
});

test('Zone 5 Pidgeotto and Zone 6 rooftop Flaaffy use existing ZA tables',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom,oldTime=globalThis.__adventureTime;globalThis.__adventureUser={userId:'zone5-zone6-evolved-growth-qa',displayName:'옥상 진화형 성장'};globalThis.__adventureTime={period:'day',hour:12};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const place=extra=>storeAdventurePosition({...rawWorld(),area:3,interior:null,zaRoyaleRank:'A',zaMission19Complete:true,zaWildVisibleAlphaLevels:{},combat:null,encounter:null,...extra},state.revision+1);seedWorld(place({district:'lumiose-zone5',x:19,y:6,facing:'up',zaZone5Upper:true,zaZone5Spent:{},zaWildShinyRolls:{'zone5:pidgeotto:17':false}}));await get();await call('zone5Wild-pidgeotto');assert.equal(rawWorld().encounter.adventureZone1GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['몸통박치기','바람일으키기','전광석화','회오리']);await call('flee');await get();seedWorld(place({district:'lumiose-zone6',x:7,y:6,facing:'up',zaZone6Layer:'roof',zaZone6Spent:{},zaWildShinyRolls:{'zone6:flaaffy:180':false}}));await get();await call('zone6Wild-flaaffy');assert.equal(rawWorld().encounter.adventureZone1GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['전기쇼크','전기자석파','충전','이상한빛']);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;globalThis.__adventureTime=oldTime;}
});
