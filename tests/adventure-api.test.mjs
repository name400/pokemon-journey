// Real route and real SQLite transactions, with only D1 transport/auth/entropy adapted
// in memory. No preview, credentials, existing DB or production state is touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
import {makeMon,moves,effectiveness} from '../lib/game.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {createCombat} from '../lib/party-battle.mjs';
import {fieldPath,findTile} from '../lib/adventure-world.mjs';
import {TRAINERS} from '../lib/campaign.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),sql=new DatabaseSync(':memory:');
for(const name of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort())sql.exec(await fs.readFile(new URL('../drizzle/'+name,import.meta.url),'utf8'));
function prepare(query,args=[]){return {bind(...values){return prepare(query,values);},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}};}};}
globalThis.__adventureEnv={DB:{prepare,async batch(statements){sql.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}}};
globalThis.__adventureUser={userId:'adventure-qa',displayName:'탐험테스트'};globalThis.__adventureRandom=()=>.999;
async function loadTS(relative){
 let source=await fs.readFile(new URL('../'+relative,import.meta.url),'utf8');
 source=source.replace(/import\s*\{\s*env\s*\}\s*from\s*['"]cloudflare:workers['"];?/g,'const env=globalThis.__adventureEnv;');
 source=source.replace(/import\s*\{getChatGPTUser\}\s*from\s*['"]@\/app\/chatgpt-auth['"];?/g,'const getChatGPTUser=async()=>globalThis.__adventureUser;');
 source=source.replace("const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;","const random=()=>globalThis.__adventureRandom();");
 const inventoryURL=relative==='app/api/world/route.ts'?await loadTS('lib/inventory.ts'):null;
 source=source.replace(/from\s*(['"])(@\/[^'"]+|\.\.?\/[^'"]+)\1/g,(_,quote,specifier)=>{
  if(specifier==='@/lib/inventory')return `from '${inventoryURL}'`;
  const url=specifier.startsWith('@/')?pathToFileURL(root+specifier.slice(2)):new URL(specifier,new URL('../'+relative,import.meta.url));return `from '${url.href}'`;
 });
 const emitted=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 return 'data:text/javascript;base64,'+Buffer.from(emitted).toString('base64');
}
const route=await import(await loadTS('app/api/world/route.ts'));
let state;
async function get(){const r=await route.GET(new Request('http://adventure.test/api/world'));assert.equal(r.status,200);return state=await r.json();}
async function call(action,extra={},expected=200){const r=await route.POST(new Request('http://adventure.test/api/world',{method:'POST',headers:{'content-type':'application/json',origin:'http://adventure.test'},body:JSON.stringify({action,revision:state?.revision,...extra})}));const d=await r.json();assert.equal(r.status,expected,`${action}: ${JSON.stringify(d)}`);if(expected===200)state=d;return d;}
function rawWorld(){return JSON.parse(sql.prepare('SELECT state FROM worlds WHERE user_id=?').get('adventure-qa').state);}
function seedWorld(patch){const w={...rawWorld(),...patch};sql.prepare('UPDATE worlds SET state=?,revision=revision+1 WHERE user_id=?').run(JSON.stringify(w),'adventure-qa');}
function rawMon(id){return JSON.parse(sql.prepare('SELECT data FROM pokemon_box WHERE id=?').get(id).data);}
function seedMon(id,p){sql.prepare('UPDATE pokemon_box SET species_id=?,data=? WHERE id=?').run(p.id,JSON.stringify(p),id);}
async function walkTo(tileOrTarget){const target=typeof tileOrTarget==='string'?findTile(state.world.map,tileOrTarget):tileOrTarget;assert.ok(target);const path=fieldPath(state.world.map,state.world,target);while(path.length){await call('move',{path:path.splice(0,8)});assert.equal(state.battle,null);}if(!['E','W'].includes(typeof tileOrTarget==='string'?tileOrTarget:''))assert.deepEqual([state.world.x,state.world.y],[target.x,target.y]);}
async function battle(){let turns=0;while(state.battle){assert.ok(turns++<180,'battle finishes');const b=state.battle,q=b.requests[0],p=b.teams[0][b.active[0]],foe=b.teams[1][b.active[1]];const command=q.kind==='switch'?{type:'switch',slot:q.switches.sort((a,b)=>b.hp-a.hp)[0].slot}:{type:'move',move:q.moves.filter(m=>!m.disabled&&m.pp>0).map(m=>({m,score:(moves[m.name]?.power||0)*effectiveness(moves[m.name]?.type,foe.types)*(p.types.includes(moves[m.name]?.type)?1.5:1)})).sort((a,b)=>b.score-a.score)[0].m.name};await call('battle',{command});if(!state.battle){assert.equal(state.battleResult?.ended,true);assert.ok(Array.isArray(state.battleResult.events));assert.equal(rawWorld().combat,null);}}return turns;}

test('world route: save migration, atomic purchases, actual battle/capture/growth and full campaign',async()=>{
 const auth=globalThis.__adventureUser;globalThis.__adventureUser=null;assert.equal((await route.GET(new Request('http://adventure.test/api/world'))).status,401);globalThis.__adventureUser=auth;
 assert.equal((await route.POST(new Request('http://adventure.test/api/world',{method:'POST',headers:{origin:'http://evil.test'},body:'{}'}))).status,403);
 await get();assert.equal(state.world,null);await call('start',{species:1});const owned=state.world.activeId;assert.equal(state.box[0].level,5);assert.equal(state.wallet.balls,5);assert.equal(state.wallet.coins,300);
 await call('start',{species:4},409);await call('move',{direction:'__proto__'},409);await call('move',{path:Array(9).fill('right')},409);await call('buy',{item:'ball'},409);
 // The lab is a real saved interior; invalid entry and group sessions stay blocked.
 await call('enterLab',{},409);seedWorld({x:18,y:5,facing:'up',unionHost:'someone'});await get();await call('enterLab',{},409);seedWorld({unionHost:null});await get();const beforeLabMon=rawMon(owned),beforeLabCoins=state.wallet.coins;await call('enterLab');assert.equal(state.world.interior,'lab');assert.deepEqual([state.world.x,state.world.y],[11,13]);await get();assert.equal(state.world.areaInfo.name,'포켓몬 연구소');await call('unionHost',{},409);await call('enterLab',{},409);await walkTo({x:11,y:6});await call('face',{direction:'up'});assert.equal(state.world.interaction.name,'포켓몬 연구원');await call('talk');assert.match(rawWorld().log[0],/진화/);await walkTo({x:11,y:14});await call('move',{path:['down','down']});assert.equal(state.world.interior,null);assert.deepEqual([state.world.x,state.world.y],[18,5]);assert.equal(state.wallet.coins,beforeLabCoins);assert.deepEqual(rawMon(owned).ivs,beforeLabMon.ivs);assert.equal(rawMon(owned).id,beforeLabMon.id);
 // The optional survey is location-gated, persistent, and pays only once.
 await call('survey',{},409);seedWorld({x:5,y:9,area:0,facing:'down',custom:'preserve'});await get();assert.equal(state.world.interaction.action,'survey');await call('survey');assert.equal(rawWorld().citySurvey.stage,1);await call('survey',{},409);
 seedWorld({area:1,badges:[]});await get();await call('survey',{},409);seedWorld({badges:[TRAINERS[0].id]});await get();await call('survey');assert.equal(rawWorld().citySurvey.stage,2);
 seedWorld({area:2,expedition:{id:1},badges:[TRAINERS[0].id,TRAINERS[1].id]});await get();await call('survey',{},409);seedWorld({expedition:null});await get();const beforeSurvey=state.wallet.coins,stale=state.revision;await call('survey');assert.equal(state.wallet.coins,beforeSurvey+300);assert.equal(rawWorld().citySurvey.stage,3);await call('survey',{},409);await call('survey',{revision:stale},409);await get();assert.equal(state.wallet.coins,beforeSurvey+300);assert.equal(rawWorld().custom,'preserve');
 seedWorld({area:0,x:3,y:8,badges:[]});sql.prepare('UPDATE wallets SET coins=300 WHERE user_id=?').run('adventure-qa');await get();
 const original=rawMon(owned),legacy={...rawWorld(),mapVersion:undefined,x:2,y:2,badges:['brock'],steps:542,custom:'preserve'};seedWorld(legacy);sql.prepare('INSERT INTO saves(user_id,data,updated_at,revision) VALUES(?,?,?,?)').run('adventure-qa','{"classic":{"keep":true}}',1,4);
 await get();assert.deepEqual([state.world.x,state.world.y],[3,5]);await call('heal');assert.deepEqual(rawMon(owned),{...original,pp:{}});assert.equal(rawWorld().custom,'preserve');assert.equal(rawWorld().steps,542);assert.deepEqual(rawWorld().badges,['brock']);assert.equal(sql.prepare('SELECT data FROM saves WHERE user_id=?').get('adventure-qa').data,'{"classic":{"keep":true}}');
 await walkTo('M');const rev=state.revision;await call('buy',{item:'ball',quantity:2});assert.equal(state.wallet.balls,7);assert.equal(state.wallet.coins,100);await call('buy',{item:'ball',revision:rev},409);await call('buy',{item:'ball',quantity:2},409);assert.equal((await get()).wallet.coins,100);await call('buy',{item:'constructor'},409);await call('buy',{item:'ball',quantity:-1},409);
 sql.prepare('UPDATE wallets SET coins=100000,balls=98 WHERE user_id=?').run('adventure-qa');await get();await call('buy',{item:'ball',quantity:2},409);assert.equal((await get()).wallet.balls,98);await call('buy',{item:'potion',quantity:2});assert.equal(state.wallet.potions,2);await call('buy',{item:'firestone'});assert.equal(state.inventory.firestone,1);await call('buy',{item:'leftovers'});await call('equip',{item:'leftovers'});assert.equal(state.inventory.leftovers,undefined);await call('equip',{item:''});assert.equal(state.inventory.leftovers,1);
 // No automatic evolution at Lv.16, including a reload and movement. Evolve preserves ownership/config.
 const level16=configure({...makeMon(1,16),ivs:original.ivs,shiny:true,walkSteps:500,friendship:180});seedMon(owned,level16);await get();await call('face',{direction:'down'});assert.equal(rawMon(owned).id,1);await call('evolve',{target:2});assert.equal(rawMon(owned).id,2);assert.equal(rawMon(owned).walkSteps,500);assert.equal(rawMon(owned).shiny,true);assert.ok(state.world.events.some(e=>e.kind==='evolve'));
 // Real combat HP/status/PP remain after escape and capture.
 let player={...configure({...makeMon(2,16),boxId:owned}),hp:12,status:'독'},foe={...makeMon(10,3),boxId:'wild'};
 const combat=createCombat([player],[foe]);combat.teams[0][0].hp=12;combat.teams[0][0].status='독';seedWorld({combat,encounter:foe,trainer:null});await get();await call('flee');assert.equal(rawMon(owned).hp,12);assert.equal(rawMon(owned).status,'독');
 const capture=createCombat([player],[foe]);capture.teams[0][0].hp=9;seedWorld({combat:capture,encounter:foe,trainer:null});await get();globalThis.__adventureRandom=()=>0;await call('ball');globalThis.__adventureRandom=()=>.999;assert.equal(state.battle,null);assert.equal(state.battleResult?.ended,true);assert.ok(state.battleResult.events.some(e=>e.kind==='capture'&&e.caught));assert.equal(rawWorld().combat,null);assert.equal(rawMon(owned).hp,9);assert.equal(state.world.teamIds.length,2);assert.ok(state.box.some(p=>p.origin==='capture'));assert.equal(state.wallet.balls,97);
 await walkTo('H');await call('heal');assert.equal(rawMon(owned).hp,rawMon(owned).maxHp);assert.equal(rawMon(owned).status,null);
 // The server interrupts a path at the first wild encounter.
 seedWorld({x:6,y:3,area:0});await get();globalThis.__adventureRandom=()=>0;await call('move',{path:['right','right','right']});globalThis.__adventureRandom=()=>.999;assert.equal(state.world.x,7);assert.ok(state.battle);await call('flee');
 // Batched routes stop at a wall or regional exit without applying later steps.
 seedWorld({x:3,y:8,area:0});await get();let steps=state.world.steps;await call('move',{path:['up','up','up','up']});assert.deepEqual([state.world.x,state.world.y],[3,5]);assert.equal(state.world.steps,steps+3);
 seedWorld({x:20,y:8,area:0});await get();steps=state.world.steps;await call('move',{path:['right','right','right','right']});assert.equal(state.world.area,1);assert.equal(state.world.steps,steps+2);
 // One-time pickup cannot mint currency twice.
 await walkTo('I');const coins=state.wallet.coins;await call('pickup');assert.equal(state.wallet.coins,coins+200);await call('pickup',{},409);
 // Full 8-gym / Elite Four / Champion run uses the unchanged actual battle engine.
 const ids=[];for(const [id,moveset]of [[150,['화염방사','10만볼트','냉동빔','사이코키네시스']],[149,['역린','지진','날개치기','불꽃펀치']],[9,['파도타기','냉동빔','악의파동','파동탄']]]){const boxId='qa-'+id,p=configure({...makeMon(id,100),moves:moveset});sql.prepare('INSERT INTO pokemon_box(id,user_id,species_id,data,origin,created_at) VALUES(?,?,?,?,?,?)').run(boxId,'adventure-qa',id,JSON.stringify(p),'qa',1);ids.push(boxId);}
 seedWorld({area:0,x:3,y:8,badges:[],league:0});await get();await call('team',{ids});
 let totalTurns=0;
 for(let i=0;i<8;i++){
  await walkTo('E');assert.equal(state.world.area,i+1);await walkTo('H');await call('heal');await walkTo('G');await call('challenge');assert.equal(state.world.trainer.id,TRAINERS[i].id);await call('flee',{},409);totalTurns+=await battle();assert.equal(state.world.badges.length,i+1);console.log(`Adventure gym ${i+1}: cleared`);
 }
 await walkTo('E');assert.equal(state.world.area,9);await walkTo('H');await call('heal');
 for(let i=0;i<5;i++){await walkTo({x:[8,11,14,17,20][i],y:4});await call('challenge');totalTurns+=await battle();assert.equal(state.world.league,i+1);console.log(`Adventure league ${i+1}: cleared`);if(i===0){await walkTo('H');await call('heal',{},409);}}
 assert.equal(state.world.completed,true);assert.equal(state.world.badges.length,8);assert.equal(state.world.hallOfFame.length,1);for(const id of ids)assert.equal(rawMon(id).level,100);
 await call('expedition',{locationId:state.expeditions[0].id});assert.ok(state.world.expedition);await walkTo('W');assert.equal(state.world.area,9);assert.equal(state.world.expedition,null);
 console.log(`Adventure save/economy/evolution/capture + 8 gyms + 5 league opponents: passed (${totalTurns} turns)`);
});
