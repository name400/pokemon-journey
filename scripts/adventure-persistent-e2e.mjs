// Local-only continuous playthrough. No production auth, state injection or network.
// Run: node scripts/adventure-persistent-e2e.mjs [status|intro]
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {fieldPath,findTile} from '../lib/cloud-adventure/adventure-world.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=path.join(root,'work','adventure-continuous-d1');
await fs.mkdir(directory,{recursive:true});
const bundle=await build({stdin:{contents:`import {GET,POST} from './lib/cloud-adventure/route.ts';export default {async fetch(req,env){if(new URL(req.url).pathname==='/__migrate'){try{const {sql}=await req.json();return Response.json(await env.DB.prepare(sql).run());}catch(e){return Response.json({error:String(e)},{status:500});}}return req.method==='POST'?POST(req):GET(req);}}`,resolveDir:root,sourcefile:'isolated-adventure-entry.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers'],plugins:[{name:'isolated-auth',setup(build){build.onResolve({filter:/^@\/app\/chatgpt-auth$/},()=>({path:'auth',namespace:'isolated'}));build.onLoad({filter:/.*/,namespace:'isolated'},()=>({contents:'export async function getChatGPTUser(){return {userId:"continuous-za-local",displayName:"격리 연속 진행"}}',loader:'js'}));}}]});
const mf=new Miniflare({modules:true,cf:false,d1Databases:{DB:'continuous-za-d1'},d1Persist:directory,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
let state;
const summary=()=>({revision:state.revision,time:state.gameTime,stage:state.world?.zaIntroStage,mission3:state.world?.zaMission03Stage,mission3Complete:state.world?.zaMission03Complete,mission4Started:state.world?.zaMission04Started,mission4Complete:state.world?.zaMission04Complete,mission5:state.world?.zaMission05Stage,mission5Complete:state.world?.zaMission05Complete,mission6Started:state.world?.zaMission06Started,bunnelby:state.world?.zaBunnelbyQuest,trade:state.world?.zaTradeQuest,sableye:state.world?.zaSableyeQuest,rank:state.world?.zaRoyaleRank,dexCount:state.world?.adventureDexSpecies?.length,area:state.world?.area,district:state.world?.district,interior:state.world?.interior,x:state.world?.x,y:state.world?.y,introX:state.world?.zaIntroX,introY:state.world?.zaIntroY,companion:state.world?.zaMission03CompanionPosition,detour:state.world?.zaMission03DetourRequired,battle:!!state.battle,interaction:state.world?.interaction?.action,log:state.world?.log?.slice(-2)});
async function get(){const r=await mf.dispatchFetch('http://adventure.test/api/world');assert.equal(r.status,200);state=await r.json();return state;}
async function call(action,extra={}){const r=await mf.dispatchFetch('http://adventure.test/api/world',{method:'POST',headers:{'content-type':'application/json',origin:'http://adventure.test'},body:JSON.stringify({action,revision:state?.revision,...extra})});const value=await r.json();if(!r.ok)throw Error(`${action}: HTTP ${r.status}: ${JSON.stringify(value)}`);state=value;console.log(JSON.stringify({action,...summary()}));return value;}
async function walkTo(target){
 const t=typeof target==='string'?findTile(state.world.map,target):target;if(!t)throw Error(`Target ${target} unavailable`);const origin=[state.world.area,state.world.district,state.world.interior],gate=typeof target==='string'&&['E','W','X'].includes(target);
 for(let i=0;i<100;i++){if(state.world.x===t.x&&state.world.y===t.y)return;const route=fieldPath(state.world.map,state.world,t);if(!route.length)throw Error(`No path to ${JSON.stringify(t)} from ${JSON.stringify(summary())}`);await call('move',{path:route.slice(0,8)});if(state.battle)throw Error('Unexpected battle; use action command to resume safely');if([state.world.area,state.world.district,state.world.interior].some((v,i)=>v!==origin[i])){if(gate)return;throw Error('Area changed before reaching target');}}
 throw Error('Walking limit reached');
}
async function fight(){
  const healed=new Set();let turns=0;while(state.battle&&turns++<60){const req=state.battle.requests[0];if(req.kind==='switch'){const target=req.switches.find(x=>x.hp>0);if(!target)throw Error('No available switch');await call('battle',{command:{type:'switch',slot:target.slot}});}else if(req.kind==='move'){const lead=state.battle.teams[0][state.battle.active[0]];if(lead.hp>0&&lead.hp<=Math.floor(lead.maxHp/2)&&state.wallet?.super_potions>0&&!healed.has(state.battle.active[0])){healed.add(state.battle.active[0]);await call('use',{item:'super'});continue;}const score=m=>(m.power||0)*(m.effectiveness??1)*(lead?.types?.includes(m.type)?1.5:1);const moves=req.moves.filter(m=>!m.disabled&&m.pp>0).sort((a,b)=>score(b)-score(a));if(!moves.length)throw Error('No selectable move');await call('battle',{command:{type:'move',move:moves[0].name}});}else throw Error(`Unsupported battle request ${req.kind}`);}
  if(state.battle)throw Error('Stopped after 60 turns, preserving battle');
 }
try{
 const marker=path.join(directory,'migrations-complete');
 try{await fs.access(marker);}catch(e){if(e.code!=='ENOENT')throw e;for(const name of (await fs.readdir(path.join(root,'drizzle'))).filter(n=>/^\d.*\.sql$/.test(n)).sort()){const sql=await fs.readFile(path.join(root,'drizzle',name),'utf8');for(const part of sql.split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean)){const r=await mf.dispatchFetch('http://adventure.test/__migrate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sql:part})});if(!r.ok)throw Error(`migration ${name}: ${await r.text()}`);}}await fs.writeFile(marker,'initialized\n',{flag:'wx'});}
 await get();console.log(JSON.stringify({action:'status',...summary()}));
 if(process.argv[2]==='intro'&&!state.world)await call('startIntro');
 if(process.argv[2]==='walk'){const raw=process.argv[3];await walkTo(raw?.startsWith('{')?JSON.parse(raw):raw);}
 if(process.argv[2]==='sequence'){for(const step of JSON.parse(process.argv[3])){if(step.walk!==undefined)await walkTo(step.walk);else if(step.fight)await fight();else await call(step.action,step.args||{});}}
 if(process.argv[2]==='box')console.log(JSON.stringify({box:state.box.map(m=>({id:m.boxId,species:m.speciesId,name:m.name,level:m.level,item:m.item})),team:state.world.teamIds}));
 if(process.argv[2]==='pending')console.log(JSON.stringify({pending:state.world?.adventurePendingMoves,team:state.world.teamIds.map(id=>state.box.find(m=>m.boxId===id)).map(m=>({id:m.boxId,name:m.name,moves:m.moves,learnable:m.learnable}))}));
 if(process.argv[2]==='party')console.log(JSON.stringify({wallet:state.wallet,team:state.world.teamIds.map(id=>state.box.find(m=>m.boxId===id)).map(m=>({id:m.boxId,species:m.speciesId,name:m.name,level:m.level,hp:m.hp,maxHp:m.maxHp,moves:m.moves}))}));
 if(process.argv[2]==='battle-info')console.log(JSON.stringify({battle:state.battle,wallet:state.wallet}));
 if(process.argv[2]==='map')console.log(JSON.stringify({map:state.world?.map,interaction:state.world?.interaction,objective:state.world?.objective}));
 if(process.argv[2]==='action'){const action=process.argv[3];if(!action)throw Error('action name required');await call(action,process.argv[4]?JSON.parse(process.argv[4]):{});}
 if(process.argv[2]==='trade-pikachu'){const mon=state.box.find(m=>m.speciesId===25);if(!mon)throw Error('Captured Pikachu unavailable');await call('tradePikachu',{boxId:mon.boxId,confirmed:true});}
 if(process.argv[2]==='lead'){const species=Number(process.argv[3]),mon=state.box.find(m=>m.speciesId===species&&state.world.teamIds.includes(m.boxId));if(!mon)throw Error('Party species not found');if(state.world.activeId!==mon.boxId)await call('setFieldLead',{id:mon.boxId});}
 if(process.argv[2]==='fight')await fight();
 if(process.argv[2]==='hunt'){
  for(let i=0;i<24;i++){
   if(state.battle){if(!(state.wallet?.balls>0))throw Error('No Poké Balls remain');await call('ball',{ball:'pokeball'});if(!state.battle)break;}
   else await call('move',{direction:state.world.x<=6?'right':'left'});
  }
 }
 if(process.argv[2]==='mission3'&&state.world?.zaMission03Stage===1){
  if(state.world.interior==='hotel2f'){await walkTo('i');await call('hotelLiftDown');}
  if(state.world.interior==='hotel'){await walkTo({x:11,y:14});await call('move',{direction:'down'});}
  if(!state.battle){await walkTo('n');await call('introRivalBattle');}
  let turns=0;while(state.battle&&turns++<40){const req=state.battle.requests[0];if(req.kind==='switch'){const target=req.switches.find(x=>x.hp>0);if(!target)throw Error('No available switch');await call('battle',{command:{type:'switch',slot:target.slot}});}else if(req.kind==='move'){const lead=state.battle.teams[0][state.battle.active[0]];if(lead.hp>0&&lead.hp<=Math.floor(lead.maxHp/2)&&state.wallet?.super_potions>0){await call('use',{item:'super'});continue;}const score=m=>(m.power||0)*(m.effectiveness??1)*(lead?.types?.includes(m.type)?1.5:1);const moves=req.moves.filter(m=>!m.disabled&&m.pp>0).sort((a,b)=>score(b)-score(a));if(!moves.length)throw Error('No selectable move');await call('battle',{command:{type:'move',move:moves[0].name}});}else throw Error(`Unsupported battle request ${req.kind}`);}
  if(state.battle)throw Error('Stopped after 40 turns, preserving battle');
 }
 if(process.argv[2]==='opening'){
  if(!state.world)await call('startIntro');
  while(state.world?.zaIntroStage==='chase'&&state.world.zaIntroX<7)await call('introMove',{direction:'right'});
  if(state.world?.zaIntroStage==='choose'&&state.world.zaIntroY===3)await call('introMove',{direction:'up'});
  if(state.world?.zaIntroStage==='choose'&&state.world.zaIntroChoice!==498)await call('introTalk',{species:498});
  if(state.world?.zaIntroStage==='choose'&&state.world.zaIntroChoice===498)await call('introConfirm',{species:498,confirmed:true});
  let steps=0;
  while(['andi','escape','brigitte','barrierRoute','barrier','tunnel','hotel'].includes(state.world?.zaIntroStage)&&steps++<100){
   const stage=state.world.zaIntroStage;
   if(state.battle){
    const req=state.battle.requests[0];
    if(req.kind==='switch'){const target=req.switches.find(x=>x.hp>0);if(!target)throw Error('No available switch');await call('battle',{command:{type:'switch',slot:target.slot}});}
    else if(req.kind==='move'){const lead=state.battle.teams[0][state.battle.active[0]];if(lead.hp>0&&lead.hp<=Math.floor(lead.maxHp/2)&&state.wallet?.super_potions>0){await call('use',{item:'super'});continue;}const score=m=>(m.power||0)*(m.effectiveness??1)*(lead?.types?.includes(m.type)?1.5:1);const moves=req.moves.filter(m=>!m.disabled&&m.pp>0).sort((a,b)=>score(b)-score(a));if(!moves.length)throw Error('No selectable move');await call('battle',{command:{type:'move',move:moves[0].name}});}
    else throw Error(`Unsupported battle request ${req.kind}`);
   }else if(stage==='andi'||stage==='brigitte')await call('introBattle');
   else if(['escape','barrierRoute','tunnel'].includes(stage))await call('introEscapeMove',{direction:'right'});
   else if(stage==='barrier')await call('introBarrier');
   else if(stage==='hotel')await call('introHotel');
  }
  if(steps>=100)throw Error('Stopped after 100 actions, preserving current save');
  if(state.world?.zaIntroStage==='reception'){await walkTo('F');await call('introReception');}
  if(state.world?.zaIntroStage==='room'){
   if(state.world.interior==='hotel'){await walkTo('i');await call('hotelLiftUp');}
   if(state.world.interior!=='hotel202'){await walkTo('o');await call('enterHotel202');}
   await walkTo('z');await call('introSleep');
  }
  if(state.world?.zaIntroStage==='door'){await walkTo({x:11,y:14});await call('move',{direction:'down'});}


 }

}finally{await mf.dispose();}
