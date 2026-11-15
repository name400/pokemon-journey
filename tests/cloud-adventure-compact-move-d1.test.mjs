// The real game route and isolated local D1 run inside a Miniflare Worker.
// Only authentication and a private test-only database setup endpoint are replaced.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {makeMon,moves,effectiveness} from '../lib/game.mjs';
import {storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {restoreMission37TripleSnapshot} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const bundle=await build({stdin:{contents:`import {GET,POST} from './app/api/world/route.ts';export default {async fetch(req,env){if(new URL(req.url).pathname==='/__fixture_d1'){try{const x=await req.json();if(x.mode==='batch')return Response.json(await env.DB.batch(x.statements.map(s=>env.DB.prepare(s.sql).bind(...s.args))));const p=env.DB.prepare(x.sql).bind(...x.args);return Response.json(await p[x.mode]());}catch(e){return Response.json({error:String(e)},{status:500});}}return req.method==='POST'?POST(req):GET(req);}}`,resolveDir:root,sourcefile:'fixture-entry.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers'],plugins:[{name:'fixture-auth',setup(build){build.onResolve({filter:/^@\/app\/chatgpt-auth$/},()=>({path:'auth',namespace:'fixture'}));build.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export async function getChatGPTUser(){return {userId:"local-d1-mission37",displayName:"격리 D1 검사"}}',loader:'js'}));}}]});
const mf=new Miniflare({modules:true,cf:false,d1Databases:['DB'],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
async function request(payload){const r=await mf.dispatchFetch('http://adventure.test/__fixture_d1',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const out=await r.json();if(!r.ok)throw Error(out.error);return out;}
function statement(sql,args=[]){return {sql,args,bind(...values){return statement(sql,values);},first(){return request({mode:'first',sql,args});},all(){return request({mode:'all',sql,args});},run(){return request({mode:'run',sql,args});}};}
const db={prepare:statement,batch(statements){return request({mode:'batch',statements:statements.map(({sql,args})=>({sql,args}))});}};
const userId='local-d1-mission37';

test('compact movement uses isolated D1 and retains position and party on reload',async()=>{try{
 for(const file of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort()){const sql=await fs.readFile(new URL('../drizzle/'+file,import.meta.url),'utf8');for(const part of sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(part).run();}
 async function get(){const res=await mf.dispatchFetch('http://adventure.test/api/world');assert.equal(res.status,200);return await res.json();}
 async function post(action,revision,extra={}){const res=await mf.dispatchFetch('http://adventure.test/api/world',{method:'POST',headers:{'content-type':'application/json',origin:'http://adventure.test'},body:JSON.stringify({action,revision,...extra})});const data=await res.json();assert.equal(res.status,200,JSON.stringify(data));return data;}
 let state=await get();state=await post('start',state.revision,{species:1});const active=state.world.activeId;
 const row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(userId).first();
 const world=storeAdventurePosition({...JSON.parse(row.state),area:3,district:'lumiose-centrico-route',interior:null,x:11,y:8,facing:'right'},row.revision+1);
 await db.prepare('UPDATE worlds SET state=?,revision=revision+1 WHERE user_id=?').bind(JSON.stringify(world),userId).run();
 state=await get();const before=state.revision;state=await post('move',before,{direction:'right',compact:true});
 assert.equal(state.world.x,12);assert.equal(state.revision,before+1);assert.equal(state.world.activeId,active);
 const restored=await get();assert.equal(restored.world.x,12);assert.equal(restored.world.activeId,active);assert.ok(restored.world.teamIds.includes(active));
 }finally{await mf.dispose();}});
