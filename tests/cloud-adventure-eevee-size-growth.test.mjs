// Real adventure API against an isolated in-memory SQLite database.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
import {evolutionOptions} from '../lib/evolution.mjs';
import {makeMon} from '../lib/game.mjs';
import {storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {prepareVerifiedWildMoves,applyAdventureLevelMoves,applyAdventureEvolutionMoves,adventureLearnableMoves} from '../lib/cloud-adventure/adventure-growth.mjs';

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

test('Eevee, Drampa and pumpkin sizes use verified growth only for new ordinary individuals',()=>{
 for(const [id,marker] of [[133,'adventureEeveeGrowthV1'],[780,'adventureZone19GrowthV1'],[710,'adventureZone15GrowthV1'],[10027,'adventureZone15GrowthV1'],[10028,'adventureZone15GrowthV1'],[10029,'adventureZone15GrowthV1']]){
  const old=makeMon(id,49),snapshot=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,snapshot);assert.equal(fresh[marker],true);assert.equal(fresh.id,id);assert.equal(fresh.formId,old.formId);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true})[marker],undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999})[marker],undefined);const unknown={...old,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown),unknown);
 }
 for(const [id,target] of [[10027,10030],[10028,10031],[10029,10032]])assert.ok(evolutionOptions(makeMon(id,42)).some(o=>o.id===target));
 for(const [id,move] of [[134,'물대포'],[135,'전기쇼크'],[136,'불꽃세례'],[196,'염동력'],[197,'바크아웃'],[470,'잎날가르기'],[471,'얼어붙은바람']]){const mon={...makeMon(id,30),adventureEeveeGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3},custom:{keep:true}},result=applyAdventureEvolutionMoves(mon,{});assert.ok(result.learned.includes(move),`${id}: ${JSON.stringify(result)}`);assert.equal(result.mon.pp.tackle,3);assert.deepEqual(result.mon.custom,{keep:true});}
 const before={...makeMon(133,49),adventureEeveeGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level:50},{});assert.deepEqual(out.pending,['이판사판태클']);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level:50},{}).includes('이판사판태클'));
});

test('ordinary super-size Pumpkaboo keeps its form and growth after capture and reload',async()=>{
 const previous=globalThis.__adventureUser,random=globalThis.__adventureRandom,time=globalThis.__adventureTime;globalThis.__adventureUser={userId:'pumpkin-size-growth-qa',displayName:'호바귀 성장'};globalThis.__adventureTime={hour:22,period:'night',dusk:false};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs),key='zone15:pumpkaboo-super:10029';seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone15',interior:null,x:18,y:6,facing:'up',zaZone15Upper:false,zaZone15Period:'night',zaWildShinyRolls:{[key]:true},zaWildVisibleAlphaLevels:{},adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();await call('zone15Wild-pumpkaboo-super');assert.equal(rawWorld().encounter.id,10029);assert.equal(rawWorld().encounter.adventureZone15GrowthV1,true);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.id===10029);assert.ok(caught);assert.equal(rawMon(caught.boxId).formId,10128);assert.equal(rawMon(caught.boxId).adventureZone15GrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=random;globalThis.__adventureTime=time;}
});

test('Zone 19 Eevee keeps ZA growth after capture and reload',async()=>{
 const previous=globalThis.__adventureUser,random=globalThis.__adventureRandom,time=globalThis.__adventureTime;globalThis.__adventureUser={userId:'eevee-growth-qa',displayName:'이브이 성장'};globalThis.__adventureTime={hour:12,period:'day'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs);seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone19',interior:null,x:3,y:2,facing:'right',zaZone19Period:'day',zaRoyaleRank:'A',zaMission19Complete:true,adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();let rolls=[0,.65,0];globalThis.__adventureRandom=()=>rolls.shift()??.999;await call('move',{direction:'right'});assert.equal(rawWorld().encounter.speciesId,133);assert.equal(rawWorld().encounter.adventureEeveeGrowthV1,true);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===133);assert.ok(caught);assert.equal(rawMon(caught.boxId).adventureEeveeGrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=random;globalThis.__adventureTime=time;}
});
