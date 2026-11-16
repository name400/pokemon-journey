// Synthetic browser tabs against the real test-gated route and isolated D1.
// This does not load or validate the game's UI or any production service.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {prototypeClockProject} from '../../../lib/cloud-adventure/adventure-clock-lease-prototype.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const bundle=await build({stdin:{contents:`import {GET,POST} from './lib/cloud-adventure/route.ts';export default {async fetch(req,env){globalThis.__adventureClockLeaseTestOnly=true;if(new URL(req.url).pathname==='/__migrate'){const {sql}=await req.json();try{return Response.json(await env.DB.prepare(sql).run());}catch(e){return Response.json({error:String(e)},{status:500});}}return req.method==='POST'?POST(req):GET(req);}}`,resolveDir:root,sourcefile:'isolated-clock-entry.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers'],plugins:[{name:'isolated-auth',setup(b){b.onResolve({filter:/^@\/app\/chatgpt-auth$/},()=>({path:'auth',namespace:'isolated'}));b.onLoad({filter:/.*/,namespace:'isolated'},()=>({contents:'export async function getChatGPTUser(){return {userId:"clock-browser-synthetic",displayName:"격리 시계"}}',loader:'js'}));}}]});
const mf=new Miniflare({modules:true,cf:false,d1Databases:{DB:'clock-browser-isolated'},compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
let browser;
try{
 for(const name of (await fs.readdir(new URL('../../../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort()){
  const sql=await fs.readFile(new URL('../../../drizzle/'+name,import.meta.url),'utf8');
  for(const part of sql.split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean)){
   const r=await mf.dispatchFetch('http://clock.test/__migrate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sql:part})});assert.equal(r.status,200,`${name}: ${await r.text()}`);
  }
 }
 const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),{chromium}=playwright.default||playwright;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext();let dropRenew=false;
 await context.route('http://clock.test/**',async route=>{
  const req=route.request();if(new URL(req.url()).pathname==='/'){await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Isolated clock harness</title>'});return;}
  const headers=await req.allHeaders(),body=req.postData()||undefined,res=await mf.dispatchFetch(req.url(),{method:req.method(),headers,body});
  if(dropRenew&&body&&JSON.parse(body).action==='clockLeaseRenew'){dropRenew=false;await res.text();await route.abort('failed');return;}
  await route.fulfill({status:res.status,contentType:'application/json',body:await res.text()});
 });
 const a=await context.newPage(),b=await context.newPage();await Promise.all([a.goto('http://clock.test/'),b.goto('http://clock.test/')]);
 const get=p=>p.evaluate(async()=>{const r=await fetch('/api/world');return {status:r.status,data:await r.json()};});
 const post=(p,body)=>p.evaluate(async body=>{try{const r=await fetch('/api/world',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};}catch{return {status:0};}},body);
 let state=await get(a);assert.equal(state.status,200);state=await post(a,{action:'start',species:498,destination:'lumiose',revision:state.data.revision});assert.equal(state.status,200,JSON.stringify(state.data));
 let ra=await post(a,{action:'clockLeaseOpen',revision:state.data.revision});assert.equal(ra.status,200);const leaseA=ra.data.clockLease;assert.ok(leaseA?.owner);assert.equal(Object.hasOwn(ra.data.world,'zaClockLeasePrototypeV1'),false);
 let rb=await get(b);rb=await post(b,{action:'clockLeaseOpen',revision:rb.data.revision});assert.equal(rb.status,200);const leaseB=rb.data.clockLease;assert.notEqual(leaseA.owner,leaseB.owner);
 const stale=await post(a,{action:'clockLeaseClose',revision:ra.data.revision,owner:leaseA.owner,generation:leaseA.generation});assert.equal(stale.status,409);
 dropRenew=true;const lost=await post(b,{action:'clockLeaseRenew',revision:rb.data.revision,owner:leaseB.owner,generation:leaseB.generation});assert.equal(lost.status,0);
 const current=await get(a);const retry=await post(b,{action:'clockLeaseRenew',revision:rb.data.revision,owner:leaseB.owner,generation:leaseB.generation});assert.equal(retry.status,409);
 const fence=await post(a,{action:'movementFence',revision:current.data.revision,activeId:current.data.world.activeId});assert.equal(fence.status,200);
 state=await get(a);const closed=await post(a,{action:'clockLeaseClose',revision:state.data.revision,owner:leaseA.owner,generation:leaseA.generation});assert.equal(closed.status,200);await b.close();
 // Closing B without a final request models an ungraceful disconnect.
 const db=await mf.getD1Database('DB');let row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('clock-browser-synthetic').first(),clock=JSON.parse(row.state).zaClockLeasePrototypeV1;
 const until=clock.leases.find(x=>x.owner===leaseB.owner).until;await new Promise(resolve=>setTimeout(resolve,Math.max(0,until-Date.now()+100)));
 state=await get(a);assert.equal(state.status,200);row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('clock-browser-synthetic').first();clock=JSON.parse(row.state).zaClockLeasePrototypeV1;
 assert.equal(prototypeClockProject(clock,Date.now()).paused,false);assert.equal(clock.revision,row.revision);assert.equal(state.data.world.activeId,current.data.world.activeId);
 const expired=await post(a,{action:'clockLeaseRenew',revision:state.data.revision,owner:leaseB.owner,generation:leaseB.generation});assert.equal(expired.status,409);
 console.log('Synthetic browser tabs: isolated D1 ownership, lost response, recovery fence, disconnect expiry and reconnect passed. Game UI was not loaded.');
 await context.close();
}finally{if(browser)await browser.close();await mf.dispose();}
