// Real local engine with an artificial experimental clock, isolated D1 only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {prototypeClockFromLegacy,prototypeClockTransition} from '../lib/cloud-adventure/adventure-clock-lease-prototype.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('local engine fences experimental leases and preserves old saves',async()=>{
 const bundle=await build({stdin:{contents:`import {GET,POST} from './lib/local-adventure-route.ts';export default {async fetch(req){globalThis.__adventureClockLeaseTestOnly=true;return req.method==='POST'?POST(req):GET(req);}}`,resolveDir:root,sourcefile:'clock-local-test.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers'],plugins:[{name:'auth',setup(b){b.onResolve({filter:/^@\/app\/chatgpt-auth$/},()=>({path:'auth',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export async function getChatGPTUser(){return {userId:"clock-local",displayName:"격리"}}',loader:'js'}));}}]});
 const mf=new Miniflare({modules:true,cf:false,d1Databases:{DB:'clock-local-isolated'},compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
 try{
  const db=await mf.getD1Database('DB');for(const name of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort())for(const part of (await fs.readFile(new URL('../drizzle/'+name,import.meta.url),'utf8')).split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(part).run();
  const call=async body=>{const r=await mf.dispatchFetch('http://clock.test/api/world',body?{method:'POST',headers:{'content-type':'application/json',origin:'http://clock.test'},body:JSON.stringify(body)}:{});return {status:r.status,data:await r.json()};};
  let r=await call({action:'start',species:1});assert.equal(r.status,200,JSON.stringify(r.data));let row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('clock-local').first(),w=JSON.parse(row.state);assert.equal(w.adventureEngine,'local');
  const now=Date.now(),clock=prototypeClockTransition(prototypeClockFromLegacy(w,row.revision,now-1000),row.revision,now-500,{type:'open',owner:'owner_123456789012345'});w.zaClockLeasePrototypeV1=clock;await db.prepare('UPDATE worlds SET state=?,revision=? WHERE user_id=?').bind(JSON.stringify(w),clock.revision,'clock-local').run();
  r=await call();assert.equal(r.status,200);assert.equal(Object.hasOwn(r.data.world,'zaClockLeasePrototypeV1'),false);const revision=r.data.revision,active=r.data.world.activeId;r=await call({action:'face',direction:'left',revision});assert.equal(r.status,200,JSON.stringify(r.data));row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('clock-local').first();w=JSON.parse(row.state);assert.equal(w.zaClockLeasePrototypeV1.revision,row.revision);assert.deepEqual(w.zaClockLeasePrototypeV1.leases,[]);assert.equal(w.activeId,active);assert.equal(w.facing,'left');
  r=await call({action:'face',direction:'right',revision});assert.notEqual(r.status,200);row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('clock-local').first();assert.equal(JSON.parse(row.state).facing,'left');
  w=JSON.parse(row.state);delete w.zaClockLeasePrototypeV1;await db.prepare('UPDATE worlds SET state=? WHERE user_id=?').bind(JSON.stringify(w),'clock-local').run();r=await call({action:'face',direction:'right',revision:row.revision});assert.equal(r.status,200,JSON.stringify(r.data));row=await db.prepare('SELECT state FROM worlds WHERE user_id=?').bind('clock-local').first();assert.equal(JSON.parse(row.state).zaClockLeasePrototypeV1,undefined);
 }finally{await mf.dispose();}
});
