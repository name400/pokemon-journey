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

test('Lab L dialogue resumes and leads through Grisham to AZ’s separate scene',async()=>{
 await get();await call('start',{species:152});const id=state.world.activeId,mon=structuredClone(rawMon(id)),wallet=structuredClone(state.wallet),team=[...state.world.teamIds],files=['a','b','e','k','future'];
 const ready={...rawWorld(),area:3,district:'lumiose-lysandre-lab',interior:null,x:11,y:9,facing:'up',zaLysandreFloor:3,zaLysandreFiles:files,zaLysandreKeyRoomV3:true,zaMission35Stage:4};seedWorld(storeAdventurePosition(ready,state.revision+1));await get();await call('mission35LabL');assert.deepEqual(state.world.zaLabLSceneV1,{version:1,step:1});assert.equal(state.world.zaMission35Stage,4);await call('move',{direction:'left'},409);await call('advanceLabLScene',{step:2},409);
 const rev=state.revision;await call('advanceLabLScene',{step:1});await call('advanceLabLScene',{step:1,revision:rev},409);await get();assert.equal(state.world.zaLabLSceneV1.step,2);await call('advanceLabLScene',{step:2});await get();await call('advanceLabLScene',{step:3});await get();assert.equal(state.world.zaLabLSceneV1.step,4);assert.equal(state.world.zaMission35Stage,4);assert.equal(state.world.district,'lumiose-lysandre-lab');await call('advanceLabLScene',{step:4});await get();assert.equal(state.world.zaLabLSceneV1,undefined);assert.equal(state.world.zaMission35Stage,5);assert.deepEqual(rawWorld().zaLysandreFiles,files);await call('advanceLabLScene',{step:4},409);await call('mission35LabL',{},409);
 seedWorld(storeAdventurePosition({...rawWorld(),district:'lumiose-magenta-sector2',interior:'lysandreCafe',x:15,y:8,facing:'up'},state.revision+1));await get();await call('mission35GrishamTalk');assert.equal(state.world.zaMission35Stage,6);assert.equal(state.world.zaMission35RoofRequired,true);seedWorld(storeAdventurePosition({...rawWorld(),district:'lumiose',interior:'hotelRoof',x:11,y:8,facing:'up'},state.revision+1));await get();await call('mission35AZ');for(const step of [1,2,3,4])await call('advanceMission35Scene',{step});await get();assert.equal(state.world.zaMission35Stage,7);assert.deepEqual(state.world.teamIds,team);assert.deepEqual(state.wallet,wallet);assert.deepEqual(rawMon(id),mon);
 seedWorld(storeAdventurePosition({...ready,zaLabLSceneV1:{version:2,step:1}},state.revision+1));await get();const before=rawWorld();await call('mission35LabL',{},409);assert.deepEqual(rawWorld(),before);
});
