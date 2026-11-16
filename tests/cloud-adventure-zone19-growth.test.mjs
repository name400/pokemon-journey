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

test('Zone 19 ordinary growth is scoped to new verified individuals',()=>{
 for(const [id,expected] of [[115,['돌진','깨물어부수기','버티기','역린']],[531,['돌진','희망사항','하이퍼보이스','이판사판태클']]]){const old=makeMon(id,50),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone19GrowthV1,true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone19GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone19GrowthV1,undefined);const future={...old,adventureZone19GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);}
 const before={...makeMon(115,53),adventureZone19GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level:54},{});assert.deepEqual(out.pending,['폭발펀치']);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level:54},{}).includes('폭발펀치'));
});

test('Zone 19 Kangaskhan and Furfrou encounters retain ZA growth after capture',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom,oldTime=globalThis.__adventureTime;globalThis.__adventureUser={userId:'zone19-growth-qa',displayName:'구역 19 성장'};globalThis.__adventureTime={period:'day',hour:12};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs),key='zone19:kangaskhan:115';seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone19',interior:null,x:17,y:4,facing:'right',zaZone19Period:'day',zaRoyaleRank:'A',zaMission19Complete:true,zaZone19Spent:{},zaWildShinyRolls:{[key]:false},zaWildVisibleAlphaLevels:{},adventureBalls:{masterball:2},combat:null,encounter:null},state.revision+1));await get();await call('zone19Wild-kangaskhan');assert.equal(rawWorld().encounter.adventureZone19GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['돌진','깨물어부수기','버티기','역린']);await get();globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===115);assert.ok(caught);assert.equal(rawMon(caught.boxId).adventureZone19GrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});globalThis.__adventureRandom=()=>.999;seedWorld(storeAdventurePosition({...rawWorld(),district:'lumiose-zone19',interior:null,x:4,y:7,facing:'right',zaZone19Period:'day',zaZone19Spent:{},zaWildShinyRolls:{'zone19:furfrou:676':false},zaWildVisibleAlphaLevels:{},combat:null,encounter:null},state.revision+1));await get();await call('zone19Wild-furfrou');assert.equal(rawWorld().encounter.adventureZone11RemainingGrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['깨물어부수기','바크아웃','이판사판태클','하이퍼보이스']);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;globalThis.__adventureTime=oldTime;}
});

test('Cleffa family and direct Zone 16 evolved encounters keep verified ZA growth',()=>{
 const old=makeMon(173,49),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,['달빛','망각술','매지컬플레임','문포스']);assert.equal(fresh.adventureCleffaGrowthV1,true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureCleffaGrowthV1,undefined);const future={...old,adventureCleffaGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureCleffaGrowthV1,undefined);
 for(const [id,level,flag,marker] of [[35,49,'zone19Evolved','adventureCleffaGrowthV1'],[180,40,'zone16Evolved','adventureZone1GrowthV1'],[308,40,'zone16Evolved','adventureZone6GrowthV1'],[121,42,'zone16Evolved','adventureZone10GrowthV1']]){const mon=makeMon(id,level);assert.equal(prepareVerifiedWildMoves(mon),mon);const opts={[flag]:true};assert.equal(prepareVerifiedWildMoves(mon,opts)[marker],true);assert.equal(prepareVerifiedWildMoves({...mon,adventureAlpha:true},opts)[marker],undefined);const unknown={...mon,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,opts),unknown);}
 for(const [id,level,move] of [[173,42,'매지컬플레임'],[35,32,'매지컬샤인'],[36,52,'에어슬래시']]){const before={...makeMon(id,level-1),adventureCleffaGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level},{});assert.deepEqual(out.pending,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level},{}).includes(move));}assert.ok(!adventureLearnableMoves({...makeMon(173,40),adventureCleffaGrowthV1:true},{}).includes('매지컬샤인'));
});

test('Zone 19 Cleffa and Clefairy retain ZA growth after encounter and capture',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom,oldTime=globalThis.__adventureTime;globalThis.__adventureUser={userId:'zone19-cleffa-growth-qa',displayName:'구역 19 삐 성장'};globalThis.__adventureTime={period:'night',hour:22};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs),key='zone19:cleffa-night:173';seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone19',interior:null,x:9,y:10,facing:'up',zaZone19Period:'night',zaRoyaleRank:'A',zaMission19Complete:true,zaZone19Spent:{},zaWildShinyRolls:{[key]:false},zaWildVisibleAlphaLevels:{},adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();await call('zone19Wild-cleffa-night');assert.equal(rawWorld().encounter.adventureCleffaGrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['달빛','망각술','매지컬플레임','문포스']);await get();globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===173);assert.ok(caught);assert.equal(rawMon(caught.boxId).adventureCleffaGrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});globalThis.__adventureRandom=()=>.999;seedWorld(storeAdventurePosition({...rawWorld(),district:'lumiose-zone19',interior:null,x:13,y:10,facing:'up',zaZone19Period:'night',zaZone19Spent:{},zaWildShinyRolls:{'zone19:clefairy-night:35':false},zaWildVisibleAlphaLevels:{},combat:null,encounter:null},state.revision+1));await get();await call('zone19Wild-clefairy-night');assert.equal(rawWorld().encounter.adventureCleffaGrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['망각술','매지컬샤인','매지컬플레임','문포스']);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;globalThis.__adventureTime=oldTime;}
});

test('Zone 16 evolved ordinary encounters receive the correct growth marker',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom,oldTime=globalThis.__adventureTime;globalThis.__adventureUser={userId:'zone16-evolved-growth-qa',displayName:'구역 16 진화형 성장'};globalThis.__adventureTime={period:'day',hour:12};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs);const place=extra=>storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone16',interior:null,zaRoyaleRank:'A',zaMission19Complete:true,zaZone16Spent:{},zaWildVisibleAlphaLevels:{},combat:null,encounter:null,...extra},state.revision+1);seedWorld(place({x:4,y:4,facing:'right',zaWildShinyRolls:{'zone16:flaaffy:180':false},adventureBalls:{masterball:1}}));await get();await call('zone16Wild-flaaffy');assert.equal(rawWorld().encounter.adventureZone1GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['코튼가드','파워젬','10만볼트','빛의장막']);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===180);assert.ok(caught);assert.equal(rawMon(caught.boxId).adventureZone1GrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});globalThis.__adventureRandom=()=>.999;seedWorld(place({x:17,y:7,facing:'right',zaWildShinyRolls:{'zone16:medicham:308':false}}));await get();await call('zone16Wild-medicham');assert.equal(rawWorld().encounter.adventureZone6GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['명상','사념의박치기','돌진','고속이동']);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;globalThis.__adventureTime=oldTime;}
});

test('Zone 16 night grass Starmie uses ZA growth on encounter and reload',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom,oldTime=globalThis.__adventureTime;globalThis.__adventureUser={userId:'zone16-starmie-growth-qa',displayName:'구역 16 아쿠스타 성장'};globalThis.__adventureTime={period:'night',hour:22};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone16',interior:null,x:3,y:3,facing:'right',zaRoyaleRank:'A',zaMission19Complete:true,zaZone16Spent:{},zaWildVisibleAlphaLevels:{},combat:null,encounter:null},state.revision+1));await get();let rolls=[0,.99,0];globalThis.__adventureRandom=()=>rolls.shift()??.999;await call('move',{direction:'right'});assert.equal(rawWorld().encounter.speciesId,121);assert.equal(rawWorld().encounter.adventureZone10GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['환상빔','빛의장막','파워젬','사이코키네시스']);await get();assert.equal(rawWorld().encounter.adventureZone10GrowthV1,true);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;globalThis.__adventureTime=oldTime;}
});
