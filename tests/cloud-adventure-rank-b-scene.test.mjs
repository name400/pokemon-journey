// Real adventure API against an isolated in-memory SQLite database.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
import {makeMon} from '../lib/game.mjs';
import {Battle} from '@pkmn/sim';
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

// This progression test requires a win: random Dark tera makes its only Psychic move fail.
test('New Corbeau victory resumes Zygarde’s entrance and leaves its battle available',async()=>{
 await get();await call('start',{species:152});const id=state.world.activeId,strong={...makeMon(150,100),boxId:id,moves:['사이코브레이크'],pp:{}};seedMon(id,strong);
 const ready={...rawWorld(),area:3,district:'lumiose-centrico-route',interior:null,x:15,y:6,facing:'up',zaRoyaleRank:'C',zaMission30Started:true,zaRoyaleCPoints:41000,zaMission30Round:2,zaMission30Won:false,combat:null,trainer:null,encounter:null};seedWorld(storeAdventurePosition(ready,state.revision+1));await get();const wallet=state.wallet.coins;await call('mission30Round');assert.equal(rawWorld().trainer.zaRankBSceneEligibleV1,true);const combat=rawWorld().combat,sim=Battle.fromJSON(combat.snapshot);for(const foe of sim.p2.pokemon){foe.teraType='Normal';foe.hp=1;foe.setStatus('slp');foe.statusState.time=99;}seedWorld({combat:{...combat,snapshot:sim.toJSON()},districtPosition:{...rawWorld().districtPosition,revision:state.revision+1}});await get();for(let i=0;state.battle&&i<10;i++)await call('battle',{command:{type:'move',move:'psystrike'}});assert.equal(state.battle,null);assert.equal(state.world.zaMission30Round,3);assert.equal(state.wallet.coins,wallet+4032);assert.deepEqual(state.world.zaRankBZygardeSceneV1,{version:1,step:1});const savedMon=structuredClone(rawMon(id));await call('mission30Round',{},409);await call('advanceRankBScene',{step:2},409);
 const rev=state.revision;await call('advanceRankBScene',{step:1});await call('advanceRankBScene',{step:1,revision:rev},409);await get();assert.equal(state.world.zaRankBZygardeSceneV1.step,2);await call('advanceRankBScene',{step:2});await get();assert.equal(state.world.zaRankBZygardeSceneV1.step,3);assert.equal(state.world.zaMission30Round,3);await call('advanceRankBScene',{step:3});await get();assert.equal(state.world.zaRankBZygardeSceneV1,undefined);assert.equal(state.world.zaMission30Round,3);assert.equal(state.wallet.coins,wallet+4032);assert.deepEqual(rawMon(id),savedMon);await call('advanceRankBScene',{step:3},409);await call('mission30Round');assert.equal(state.battle.teams[1][0].speciesId,718);await call('forfeit');assert.equal(state.world.zaMission30Round,3);seedWorld(storeAdventurePosition({...rawWorld(),district:'lumiose-centrico-route',interior:null,x:15,y:6,facing:'up'},state.revision+1));await get();await call('mission30Round');const nextCombat=rawWorld().combat,nextSim=Battle.fromJSON(nextCombat.snapshot);nextSim.p2.pokemon[0].teraType='Normal';nextSim.p2.pokemon[0].hp=1;nextSim.p2.pokemon[0].setStatus('slp');nextSim.p2.pokemon[0].statusState.time=99;seedWorld({combat:{...nextCombat,snapshot:nextSim.toJSON()},districtPosition:{...rawWorld().districtPosition,revision:state.revision+1}});await get();await call('battle',{command:{type:'move',move:'psystrike'}});assert.equal(state.world.zaMission30Round,4);assert.equal(state.world.zaRankBZygardeSceneV1,undefined);
});

test('Existing round 3 saves and unknown scene versions remain usable',async()=>{
 const ready={...rawWorld(),area:3,district:'lumiose-centrico-route',interior:null,x:15,y:6,facing:'up',zaRoyaleRank:'C',zaMission30Started:true,zaRoyaleCPoints:41000,zaMission30Round:3,zaMission30Won:false,combat:null,trainer:null,encounter:null,zaRankBZygardeSceneV1:{version:2,step:1}};seedWorld(storeAdventurePosition(ready,state.revision+1));await get();await call('mission30Round');assert.deepEqual(rawWorld().zaRankBZygardeSceneV1,{version:2,step:1});await call('forfeit');assert.deepEqual(rawWorld().zaRankBZygardeSceneV1,{version:2,step:1});
});

test('An already-running Corbeau battle without the scene marker keeps its original progression',async()=>{
 const oldUser=globalThis.__adventureUser;globalThis.__adventureUser={userId:'rank-b-old-battle',displayName:'구형 토너먼트'};
 try{
  await get();await call('start',{species:152});const id=state.world.activeId;seedMon(id,{...makeMon(150,100),boxId:id,moves:['사이코브레이크'],pp:{}});
  seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-centrico-route',interior:null,x:15,y:6,facing:'up',zaRoyaleRank:'C',zaMission30Started:true,zaRoyaleCPoints:41000,zaMission30Round:2,zaMission30Won:false,combat:null,trainer:null,encounter:null},state.revision+1));await get();await call('mission30Round');const before=rawWorld(),trainer={...before.trainer};delete trainer.zaRankBSceneEligibleV1;const sim=Battle.fromJSON(before.combat.snapshot);for(const foe of sim.p2.pokemon){foe.teraType='Normal';foe.hp=1;foe.setStatus('slp');foe.statusState.time=99;}const combat={...before.combat,snapshot:sim.toJSON()};seedWorld({combat,trainer,districtPosition:{...before.districtPosition,revision:state.revision+1}});await get();assert.deepEqual(rawWorld().combat.snapshot,JSON.parse(JSON.stringify(combat.snapshot)));for(let i=0;state.battle&&i<10;i++)await call('battle',{command:{type:'move',move:'psystrike'}});assert.equal(state.battle,null);assert.equal(state.world.zaMission30Round,3);assert.equal(state.world.zaRankBZygardeSceneV1,undefined);await call('mission30Round');assert.equal(state.battle.teams[1][0].speciesId,718);
 }finally{globalThis.__adventureUser=oldUser;}
});
