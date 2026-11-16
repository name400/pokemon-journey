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

test('ordinary lab and sewer encounters use scoped ZA growth and preserve unknown records',()=>{
 for(const [id,level,flag,marker] of [[374,49,'lysandreEvolved','adventureZone20GrowthV1'],[375,50,'lysandreEvolved','adventureZone20GrowthV1'],[229,49,'lysandreEvolved','adventureZone6GrowthV1'],[310,49,'lysandreEvolved','adventureElectrikeGrowthV1'],[715,49,'lysandreEvolved','adventureZone18BirdGrowthV1'],[690,34,'sewerField','adventureZone20GrowthV1'],[168,38,'sewerField','adventureZone4GrowthV1'],[686,35,'sewerField','adventureZone11WaterGrowthV1'],[714,34,'sewerField','adventureZone18BirdGrowthV1']]){const old=makeMon(id,level),copy=structuredClone(old),opts={[flag]:true},fresh=prepareVerifiedWildMoves(old,opts);assert.deepEqual(old,copy);assert.equal(fresh[marker],true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},opts)[marker],undefined);const unknown={...old,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,opts),unknown);assert.equal(prepareVerifiedWildMoves({...old,formId:999},opts)[marker],undefined);}
 const beldum=prepareVerifiedWildMoves(makeMon(374,49),{lysandreEvolved:true});assert.deepEqual(beldum.moves,['몸통박치기']);const evolved={...makeMon(375,50),adventureZone20GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureEvolutionMoves(evolved,{});assert.deepEqual(out.learned,['염동력','메탈클로']);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...makeMon(376,60),adventureZone20GrowthV1:true},{}).includes('헤비봄버'));
});

test('lab Metang battle and sewer Inkay direct capture keep growth after reload',async()=>{
 const previous=globalThis.__adventureUser,random=globalThis.__adventureRandom,time=globalThis.__adventureTime;globalThis.__adventureUser={userId:'lab-sewer-growth-qa',displayName:'연구소 성장'};globalThis.__adventureTime={hour:12,period:'day'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs),key='lab:metang:375';seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-lysandre-lab',interior:null,x:4,y:7,facing:'left',zaMission35Stage:4,zaLysandreFloor:1,zaLysandreMazeV2:true,zaLysandreWing:'e',zaLysandreWildSpent:{},zaWildShinyRolls:{[key]:false},zaWildVisibleAlphaLevels:{},adventureBalls:{masterball:2},combat:null,encounter:null},state.revision+1));await get();await call('lysandreWild-metang');assert.equal(rawWorld().encounter.adventureZone20GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['돌진','사이코커터','사이코키네시스','아이언헤드']);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const metang=state.box.find(m=>m.speciesId===375);assert.ok(metang);assert.equal(rawMon(metang.boxId).adventureZone20GrowthV1,true);while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});globalThis.__adventureRandom=()=>.999;seedWorld(storeAdventurePosition({...rawWorld(),district:'lumiose-crystal-sewer',interior:null,x:17,y:5,facing:'right',zaMission20Stage:9,zaMagentaSewerSpent:{},zaMagentaSewerPositions:undefined,combat:null,encounter:null},state.revision+1));await get();globalThis.__adventureRandom=()=>0;await call('throwMagentaSewerField',{targetId:'inkay',ball:'masterball'});await get();const inkay=state.box.find(m=>m.speciesId===686);assert.ok(inkay);assert.equal(rawMon(inkay.boxId).adventureZone11WaterGrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);assert.equal(rawWorld().zaMission20Stage,9);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=random;globalThis.__adventureTime=time;}
});
