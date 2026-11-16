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

test('roof wild encounters keep reviewed ordinary forms and their growth after capture',async()=>{
 const previous=globalThis.__adventureUser,random=globalThis.__adventureRandom,time=globalThis.__adventureTime;globalThis.__adventureUser={userId:'roof-wild-growth-qa',displayName:'옥상 성장'};globalThis.__adventureTime={hour:12,period:'day'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs);for(const [district,x,y,id,marker,moves] of [['lumiose-zone3-south-roof',14,4,677,'adventureZone9PsychicGrowthV1',['몸통박치기','순간이동','차밍보이스','염동력']],['lumiose-rouge-sector1-roof',9,5,666,'adventureScatterbugMovesV1',['독가루','수면가루','저리가루','엉겨붙기']]]){globalThis.__adventureRandom=()=>.999;seedWorld(storeAdventurePosition({...rawWorld(),area:3,district,interior:null,x,y,facing:'right',adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();globalThis.__adventureRandom=()=>0;await call('move',{direction:'right'});const foe=rawWorld().encounter;assert.equal(foe.speciesId,id);assert.equal(foe.formId,id);assert.equal(foe[marker],true);assert.deepEqual(foe.moves,moves);const gender=foe.gender;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===id);assert.ok(caught);assert.equal(rawMon(caught.boxId)[marker],true);assert.equal(rawMon(caught.boxId).gender,gender);assert.equal(rawMon(caught.boxId).formId,id);while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});}assert.deepEqual(rawMon(lead).ivs,iv);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=random;globalThis.__adventureTime=time;}
});

test('Meowstic growth remains scoped to the correct male and female forms',()=>{for(const [id,gender,expected,absent] of [[678,'M','회복봉인','섀도볼'],[10025,'F','섀도볼','회복봉인']]){const mon={...makeMon(id,50),gender,adventureZone9PsychicGrowthV1:true};const learned=adventureLearnableMoves(mon,{});assert.ok(learned.includes(expected));assert.ok(!learned.includes(absent));}const old=makeMon(677,9),copy=structuredClone(old);prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);const future={...old,adventureZone9PsychicGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);});
