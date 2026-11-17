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
const bundle=await build({stdin:{contents:`import {GET,POST} from './lib/cloud-adventure/route.ts';export default {async fetch(req,env){if(new URL(req.url).pathname==='/__fixture_d1'){try{const x=await req.json();if(x.mode==='batch')return Response.json(await env.DB.batch(x.statements.map(s=>env.DB.prepare(s.sql).bind(...s.args))));const p=env.DB.prepare(x.sql).bind(...x.args);return Response.json(await p[x.mode]());}catch(e){return Response.json({error:String(e)},{status:500});}}return req.method==='POST'?POST(req):GET(req);}}`,resolveDir:root,sourcefile:'fixture-entry.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers'],plugins:[{name:'fixture-auth',setup(build){build.onResolve({filter:/^@\/app\/chatgpt-auth$/},()=>({path:'auth',namespace:'fixture'}));build.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export async function getChatGPTUser(){return {userId:"local-d1-side118",displayName:"격리 D1 검사"}}',loader:'js'}));}}]});
const mf=new Miniflare({modules:true,cf:false,d1Databases:['DB'],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
async function request(payload){const r=await mf.dispatchFetch('http://adventure.test/__fixture_d1',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const out=await r.json();if(!r.ok)throw Error(out.error);return out;}
function statement(sql,args=[]){return {sql,args,bind(...values){return statement(sql,values);},first(){return request({mode:'first',sql,args});},all(){return request({mode:'all',sql,args});},run(){return request({mode:'run',sql,args});}};}
const db={prepare:statement,batch(statements){return request({mode:'batch',statements:statements.map(({sql,args})=>({sql,args}))});}};
const userId='local-d1-side118';

test('side 118 blocked rewards survive concurrent claims and D1 reload',async()=>{try{
 for(const file of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort()){
  const sql=await fs.readFile(new URL('../drizzle/'+file,import.meta.url),'utf8');
  for(const part of sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(part).run();
 }
 let state;
 async function get(){const r=await mf.dispatchFetch('http://adventure.test/api/world');assert.equal(r.status,200);return state=await r.json();}
 async function post(action,revision=state.revision){const r=await mf.dispatchFetch('http://adventure.test/api/world',{method:'POST',headers:{'content-type':'application/json',origin:'http://adventure.test'},body:JSON.stringify({action,revision,...(action==='start'?{species:1}:{})})});const body=await r.json();if(r.status===200)state=body;return {status:r.status,body};}
 await get();assert.equal((await post('start',state.revision)).status,200);const id=state.world.activeId,team=structuredClone(state.world.teamIds),coins=state.wallet.coins,before=await db.prepare('SELECT data FROM pokemon_box WHERE id=?').bind(id).first();
 const keys=Object.fromEntries(['za-exp-candy-l','za-exp-candy-xl'].map(item=>[item,JSON.stringify([userId,item])]));
 for(const item of Object.keys(keys))await db.prepare('INSERT INTO inventory(key,user_id,item,quantity) VALUES(?,?,?,999)').bind(keys[item],userId,item).run();
 const row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(userId).first();const world=storeAdventurePosition({...JSON.parse(row.state),area:3,district:'lumiose-galerie-lune',interior:null,x:11,y:8,facing:'up',zaSide118Stage:5},row.revision+1);
 await db.prepare('UPDATE worlds SET state=?,revision=revision+1 WHERE user_id=?').bind(JSON.stringify(world),userId).run();await get();const initialRevision=state.revision;
 const claims=await Promise.all([0,1].map(()=>post('side118Reward',initialRevision)));assert.deepEqual(claims.map(x=>x.status).sort(),[200,409]);await get();assert.equal(state.world.zaSide118Complete,true);assert.deepEqual(state.world.zaSide118RewardPending,{large:2,xl:1});assert.equal(state.wallet.coins,coins+4000);assert.deepEqual(state.world.teamIds,team);assert.equal(state.world.activeId,id);
 await db.prepare('UPDATE inventory SET quantity=998 WHERE key=?').bind(keys['za-exp-candy-xl']).run();await get();const partialRevision=state.revision;
 const partial=await Promise.all([0,1].map(()=>post('claimSide118Rewards',partialRevision)));assert.deepEqual(partial.map(x=>x.status).sort(),[200,409]);await get();assert.deepEqual(state.world.zaSide118RewardPending,{large:2,xl:0});assert.equal(state.inventory['za-exp-candy-xl'],999);assert.equal(state.wallet.coins,coins+4000);
 await db.prepare('UPDATE inventory SET quantity=997 WHERE key=?').bind(keys['za-exp-candy-l']).run();await get();assert.equal((await post('claimSide118Rewards')).status,200);await get();assert.deepEqual(state.world.zaSide118RewardPending,{large:0,xl:0});assert.equal(state.inventory['za-exp-candy-l'],999);assert.equal(state.inventory['za-exp-candy-xl'],999);assert.equal(state.wallet.coins,coins+4000);assert.deepEqual(state.world.teamIds,team);assert.deepEqual(await db.prepare('SELECT data FROM pokemon_box WHERE id=?').bind(id).first(),before);assert.equal((await db.prepare('SELECT count(*) AS n FROM pokemon_box WHERE user_id=?').bind(userId).first()).n,1);assert.equal((await post('claimSide118Rewards')).status,409);assert.equal((await post('side118Reward')).status,409);
 }finally{await mf.dispose();}});
