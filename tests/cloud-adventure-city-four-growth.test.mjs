// Real adventure API against an isolated in-memory SQLite database.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
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

test('four city encounters and their ordinary evolutions use scoped ZA growth',()=>{
 for(const [id,level,expected] of [[280,10,['차밍보이스','울음소리','염동력','최면술']],[702,20,['충전','애교부리기','파라볼라차지','괴전파']],[147,28,['전기자석파','돌진','와이드브레이커','세차게휘두르기']],[704,20,['애교부리기','용의숨결','방어','머드샷']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old,{cityResearch:true});assert.deepEqual(old,copy);assert.equal(prepareVerifiedWildMoves(old),old);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone20GrowthV1,true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},{cityResearch:true}).adventureZone20GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999},{cityResearch:true}).adventureZone20GrowthV1,undefined);const unknown={...old,adventureZone20GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,{cityResearch:true}),unknown);}
 for(const [id,level,move] of [[281,44,'매지컬플레임'],[475,50,'리프블레이드'],[149,60,'파괴광선'],[706,58,'파워휩'],[702,50,'번개']]){const before={...makeMon(id,level-1),adventureZone20GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level},{});assert.deepEqual(out.pending,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level},{}).includes(move));}
 for(const [id,move] of [[282,'매지컬샤인'],[475,'베어가르기'],[149,'폭풍']]){const mon={...makeMon(id,50),adventureZone20GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}},result=applyAdventureEvolutionMoves(mon,{});assert.deepEqual(result.learned,[move]);assert.equal(result.mon.pp.tackle,3);}
});

test('city Ralts capture, reload and Kirlia evolution preserve stored data',async()=>{
 const previous=globalThis.__adventureUser,random=globalThis.__adventureRandom,time=globalThis.__adventureTime;globalThis.__adventureUser={userId:'city-ralts-growth-qa',displayName:'랄토스 성장'};globalThis.__adventureTime={hour:12,period:'day'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs),key='cityResearch:magenta7-ralts:280';seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-magenta-sector7',interior:null,x:5,y:4,facing:'down',zaMagenta7NorthOpen:true,zaWildShinyRolls:{[key]:false},adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();await call('cityResearchBattle');assert.equal(rawWorld().encounter.adventureZone20GrowthV1,true);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===280);assert.ok(caught);const id=caught.boxId;assert.equal(rawMon(id).adventureZone20GrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);seedMon(id,{...rawMon(id),level:20,pp:{growl:3},custom:{keep:true}});await get();await call('evolve',{boxId:id,target:281});await get();assert.equal(rawMon(id).adventureZone20GrowthV1,true);assert.equal(rawMon(id).pp.growl,3);assert.deepEqual(rawMon(id).custom,{keep:true});
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=random;globalThis.__adventureTime=time;}
});
