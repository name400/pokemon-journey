// The real game route and isolated local D1 run inside a Miniflare Worker.
// Only authentication and a private test-only database setup endpoint are replaced.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {makeMon} from '../lib/game.mjs';
import {storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const bundle=await build({stdin:{contents:`import {GET,POST} from './lib/cloud-adventure/route.ts';export default {async fetch(req,env){if(new URL(req.url).pathname==='/__fixture_d1'){try{const x=await req.json();if(x.mode==='batch')return Response.json(await env.DB.batch(x.statements.map(s=>env.DB.prepare(s.sql).bind(...s.args))));const p=env.DB.prepare(x.sql).bind(...x.args);return Response.json(await p[x.mode]());}catch(e){return Response.json({error:String(e)},{status:500});}}return req.method==='POST'?POST(req):GET(req);}}`,resolveDir:root,sourcefile:'fixture-entry.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers'],plugins:[{name:'fixture-auth',setup(build){build.onResolve({filter:/^@\/app\/chatgpt-auth$/},()=>({path:'auth',namespace:'fixture'}));build.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export async function getChatGPTUser(){return {userId:"local-d1-mission38",displayName:"격리 D1 검사"}}',loader:'js'}));}}]});
const mf=new Miniflare({modules:true,cf:false,d1Databases:['DB'],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
async function request(payload){const r=await mf.dispatchFetch('http://adventure.test/__fixture_d1',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const out=await r.json();if(!r.ok)throw Error(out.error);return out;}
function statement(sql,args=[]){return {sql,args,bind(...values){return statement(sql,values);},first(){return request({mode:'first',sql,args});},all(){return request({mode:'all',sql,args});},run(){return request({mode:'run',sql,args});}};}
const db={prepare:statement,batch(statements){return request({mode:'batch',statements:statements.map(({sql,args})=>({sql,args}))});}};
const userId='local-d1-mission38';

test('mission 38 gift keeps full party and rewards exactly once in local D1',async()=>{try{
 for(const file of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort()){
  const sql=await fs.readFile(new URL('../drizzle/'+file,import.meta.url),'utf8');
  for(const part of sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(part).run();
 }
 let state;
 async function get(){const r=await mf.dispatchFetch('http://adventure.test/api/world');assert.equal(r.status,200);return state=await r.json();}
 async function call(action,extra={},expected=200){const r=await mf.dispatchFetch('http://adventure.test/api/world',{method:'POST',headers:{'content-type':'application/json',origin:'http://adventure.test'},body:JSON.stringify({action,revision:state?.revision,...extra})});const data=await r.json();assert.equal(r.status,expected,`${action}: ${JSON.stringify(data)}`);if(expected===200)state=data;return data;}
 await get();await call('start',{species:1});const id=state.world.activeId,coins=state.wallet.coins,team=[id];
 for(let n=0;n<5;n++){const boxId=`d1-gift-reserve-${n}`,mon={...makeMon(25,10),boxId};await db.prepare('INSERT INTO pokemon_box(id,user_id,species_id,data,origin,created_at) VALUES(?,?,?,?,?,?)').bind(boxId,userId,mon.id,JSON.stringify(mon),'qa',n+1).run();team.push(boxId);}
 let row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(userId).first();
 let world=storeAdventurePosition({...JSON.parse(row.state),area:3,district:'lumiose',interior:'hotel202',x:11,y:7,facing:'up',teamIds:team,zaMission37Complete:true,zaMission38Started:true},row.revision+1);
 await db.prepare('UPDATE worlds SET state=?,revision=revision+1 WHERE user_id=?').bind(JSON.stringify(world),userId).run();
 await get();assert.equal(state.world.interaction.action,'claimMission38Lucario');const before=await db.prepare('SELECT data FROM pokemon_box WHERE id=?').bind(id).first(),revision=state.revision;
 // Two independent tabs submit the same revision concurrently to the real D1 route.
 const requests=await Promise.all([0,1].map(()=>mf.dispatchFetch('http://adventure.test/api/world',{method:'POST',headers:{'content-type':'application/json',origin:'http://adventure.test'},body:JSON.stringify({action:'claimMission38Lucario',revision})})));
 assert.deepEqual(requests.map(r=>r.status).sort(),[200,409]);state=await requests.find(r=>r.status===200).json();const giftId=state.world.zaMission38AZLucarioId;assert.ok(giftId);assert.deepEqual(state.world.teamIds,team);assert.equal(state.wallet.coins,coins);
 const gift=await db.prepare('SELECT data FROM pokemon_box WHERE id=?').bind(giftId).first();assert.equal(JSON.parse(gift.data).speciesId,448);
 await call('claimMission38Lucario',{revision},409);await get();assert.equal(state.world.zaMission38AZLucarioClaimed,true);assert.deepEqual(state.world.teamIds,team);assert.equal(state.wallet.coins,coins);
 assert.deepEqual(await db.prepare('SELECT data FROM pokemon_box WHERE id=?').bind(id).first(),before);assert.deepEqual(await db.prepare('SELECT data FROM pokemon_box WHERE id=?').bind(giftId).first(),gift);
 assert.equal((await db.prepare('SELECT count(*) AS n FROM pokemon_box WHERE user_id=?').bind(userId).first()).n,7);await call('claimMission38Lucario',{},409);
 }finally{await mf.dispose();}});
