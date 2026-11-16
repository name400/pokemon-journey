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

test('verified ordinary flower colors and Honedge growth preserve forms and saved data',()=>{
 for(const id of [669,30103,30104,30105,30106]){const old=makeMon(id,10),snapshot=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,snapshot);assert.equal(fresh.adventureFlowerGrowthV1,true);assert.deepEqual(fresh.moves,['몸통박치기','덩굴채찍','요정의바람','신비의부적']);assert.deepEqual([fresh.id,fresh.formId],[old.id,old.formId]);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureFlowerGrowthV1,undefined);const unknown={...old,adventureFlowerGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown),unknown);}
 for(const [id,flag] of [[670,'zone7Evolved'],[30110,'zone7Evolved'],[671,'zone16Evolved'],[30114,'zone16Evolved'],[680,'lysandreEvolved']]){const old=makeMon(id,40);assert.equal(prepareVerifiedWildMoves(old),old);const marker=id===680?'adventureHonedgeGrowthV1':'adventureFlowerGrowthV1';assert.equal(prepareVerifiedWildMoves(old,{[flag]:true})[marker],true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},{[flag]:true})[marker],undefined);const unknown={...old,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,{[flag]:true}),unknown);}
 for(const id of [10061,10296,10026]){const mon=makeMon(id,45);assert.equal(prepareVerifiedWildMoves(mon,{zone7Evolved:true,zone16Evolved:true,lysandreEvolved:true}),mon);}
 const sword=prepareVerifiedWildMoves(makeMon(679,47));assert.deepEqual(sword.moves,['섀도클로','철벽','아이언헤드','칼춤']);assert.ok(adventureLearnableMoves(sword,{}).includes('성스러운칼'));
 for(const [id,marker,move] of [[30110,'adventureFlowerGrowthV1','문포스'],[681,'adventureHonedgeGrowthV1','킹실드']]){const mon={...makeMon(id,45),[marker]:true,moves:['몸통박치기'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureEvolutionMoves(mon,{});assert.deepEqual(out.learned,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
 const before={...makeMon(680,37),adventureHonedgeGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3}},out=applyAdventureLevelMoves(before,{...before,level:38},{});assert.deepEqual(out.pending,['아이언헤드']);assert.equal(out.mon.pp.tackle,3);
});

test('white flower capture and evolution preserve form, growth, PP and reload',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom;globalThis.__adventureUser={userId:'flower-growth-qa',displayName:'꽃 성장'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs),key='cityResearch:flabebe-white:669';seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-vert-sector3',interior:null,x:20,y:4,facing:'left',zaWildShinyRolls:{[key]:false},adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();await call('cityResearchBattle');assert.deepEqual([rawWorld().encounter.id,rawWorld().encounter.formId,rawWorld().encounter.adventureFlowerGrowthV1],[30106,10106,true]);assert.deepEqual(rawWorld().encounter.moves,['몸통박치기','덩굴채찍','요정의바람','신비의부적']);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.id===30106);assert.ok(caught);const id=caught.boxId;seedMon(id,{...rawMon(id),level:25,pp:{tackle:3},custom:{keep:true}});await get();await call('evolve',{boxId:id,target:30110});await get();assert.deepEqual([rawMon(id).id,rawMon(id).formId,rawMon(id).adventureFlowerGrowthV1],[30110,10110,true]);assert.equal(rawMon(id).pp.tackle,3);assert.deepEqual(rawMon(id).custom,{keep:true});assert.deepEqual(rawMon(lead).ivs,iv);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;}
});

test('Lysandre Lab ordinary Honedge and Doublade use verified growth',async()=>{
 const previous=globalThis.__adventureUser,oldRandom=globalThis.__adventureRandom;globalThis.__adventureUser={userId:'lab-honedge-growth-qa',displayName:'연구소 단칼빙 성장'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs);const place=extra=>storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-lysandre-lab',interior:null,zaMission35Stage:4,zaLysandreFloor:1,zaLysandreMazeV2:true,zaLysandreWing:'e',zaLysandreWildSpent:{},zaWildVisibleAlphaLevels:{},combat:null,encounter:null,...extra},state.revision+1);seedWorld(place({x:16,y:3,facing:'right',zaWildShinyRolls:{'lab:honedge:679':false},adventureBalls:{masterball:1}}));await get();await call('lysandreWild-honedge');assert.equal(rawWorld().encounter.adventureHonedgeGrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['섀도클로','철벽','아이언헤드','칼춤']);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===679);assert.ok(caught);assert.equal(rawMon(caught.boxId).adventureHonedgeGrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});globalThis.__adventureRandom=()=>.999;seedWorld(place({x:17,y:4,facing:'right',zaWildShinyRolls:{'lab:doublade:680':false}}));await get();await call('lysandreWild-doublade');assert.equal(rawWorld().encounter.adventureHonedgeGrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['섀도클로','철벽','아이언헤드','칼춤']);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=oldRandom;}
});
