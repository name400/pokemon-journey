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

test('direct evolved encounters use scoped ZA moves and preserve unverified records',()=>{
 for(const [id,level,flag,marker,moves] of [[14,6,'zone2Evolved','adventureZone1GrowthV1',['독침','실뿜기']],[14,20,'zone7Evolved','adventureZone1GrowthV1',['독침','실뿜기','단단해지기']],[315,20,'zone7Evolved','adventureZone2GrowthV1',['바늘미사일','씨뿌리기','매지컬리프','수면가루']],[15,41,'zone15Evolved','adventureZone1GrowthV1',['독압정','덤벼들기','독찌르기','드릴라이너']],[544,40,'zone15Evolved','adventureZone5GrowthV1',['바늘미사일','돌진','독찌르기','맹독']],[545,42,'zone15Evolved','adventureZone5GrowthV1',['돌진','독찌르기','맹독','아이언테일']],[93,40,'zone15Evolved','adventureZone4GrowthV1',['흑안개','얼어붙은바람','악의파동','섀도볼']],[665,10,'zone4Evolved','adventureScatterbugMovesV1',['실뿜기','몸통박치기','저리가루','엉겨붙기']],[662,28,'zone9Evolved','adventureFletchlingMovesV1',['불꽃세례','깃털댄스','날려버리기','화염바퀴']]]){
 const old=makeMon(id,level),snapshot=structuredClone(old),opts={[flag]:true},fresh=prepareVerifiedWildMoves(old,opts);assert.deepEqual(old,snapshot);assert.equal(prepareVerifiedWildMoves(old),old);assert.equal(fresh[marker],true);assert.deepEqual(fresh.moves,moves);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},opts)[marker],undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999},opts)[marker],undefined);const unknown={...old,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,opts),unknown);
 }
 const before={...makeMon(545,43),adventureZone5GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level:44},{});assert.deepEqual(out.pending,['시저크로스']);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});
});

test('Zone 15 evolved encounters preserve growth in battle, capture and reload',async()=>{
 const previous=globalThis.__adventureUser,random=globalThis.__adventureRandom,time=globalThis.__adventureTime;globalThis.__adventureUser={userId:'zone15-evolved-growth-qa',displayName:'구역 15 성장'};globalThis.__adventureTime={hour:12,period:'day'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});const lead=state.world.activeId,iv=structuredClone(rawMon(lead).ivs);seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone15',interior:null,x:7,y:13,facing:'up',zaZone15Upper:false,zaZone15Period:'day',zaZone15Spent:{},zaWildVisibleAlphaLevels:{},zaWildShinyRolls:{'zone15:beedrill-garden:15':false},adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();await call('zone15Wild-beedrill-garden');assert.equal(rawWorld().encounter.adventureZone1GrowthV1,true);assert.deepEqual(rawWorld().encounter.moves,['독압정','덤벼들기','독찌르기','드릴라이너']);globalThis.__adventureRandom=()=>0;await call('ball',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===15);assert.ok(caught);assert.equal(rawMon(caught.boxId).adventureZone1GrowthV1,true);assert.deepEqual(rawMon(lead).ivs,iv);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=random;globalThis.__adventureTime=time;}
});

test('Zone 2 Kakuna field throw and Zone 7 Roselia grass apply their growth markers',async()=>{
 const previous=globalThis.__adventureUser,random=globalThis.__adventureRandom,time=globalThis.__adventureTime;globalThis.__adventureUser={userId:'evolved-zone2-zone7-qa',displayName:'야생 성장'};globalThis.__adventureTime={hour:12,period:'day'};globalThis.__adventureRandom=()=>.999;
 try{await get();await call('start',{species:152});seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone2',interior:null,x:1,y:4,facing:'left',zaZone2KakunaSpent:false,zaWildVisibleAlphaLevels:{},zaWildShinyRolls:{'field2:kakuna:14':false},adventureBalls:{masterball:1},combat:null,encounter:null},state.revision+1));await get();globalThis.__adventureRandom=()=>0;await call('throwZone2Kakuna',{ball:'masterball'});await get();const caught=state.box.find(m=>m.speciesId===14);assert.ok(caught);assert.equal(rawMon(caught.boxId).adventureZone1GrowthV1,true);assert.deepEqual(rawMon(caught.boxId).moves,['독침','실뿜기']);
 while(state.world.adventurePendingMoves?.length)await call('resolveAdventureMove',{slot:null});globalThis.__adventureRandom=()=>.999;seedWorld(storeAdventurePosition({...rawWorld(),area:3,district:'lumiose-zone7',interior:null,x:11,y:13,facing:'left',zaRoyaleRank:'F',combat:null,encounter:null},state.revision+1));await get();let rolls=[0,.6,0];globalThis.__adventureRandom=()=>rolls.shift()??.999;await call('move',{direction:'left'});assert.equal(rawWorld().encounter.speciesId,315);assert.equal(rawWorld().encounter.adventureZone2GrowthV1,true);
 }finally{globalThis.__adventureUser=previous;globalThis.__adventureRandom=random;globalThis.__adventureTime=time;}
});
