// Isolated D1: never uses a deployed database or existing game save.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {prototypeClockFromLegacy,prototypeClockTransition,prototypeClockProject} from '../lib/cloud-adventure/adventure-clock-lease-prototype.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('reset and restore rebase the experimental clock without reviving leases',async()=>{
 const bundle=await build({stdin:{contents:`import {env} from 'cloudflare:workers';import {adminResetInfo,resetAdminPlayer,restoreAdminPlayer} from './lib/admin-player-reset.ts';export default {async fetch(req){globalThis.__adventureClockLeaseTestOnly=true;const {method,payload}=await req.json();try{return Response.json(method==='info'?await adminResetInfo(env.DB,payload.target,'adventure'):method==='reset'?await resetAdminPlayer(env.DB,'admin',payload):await restoreAdminPlayer(env.DB,'admin',payload));}catch(e){return Response.json({error:String(e)},{status:409});}}}`,resolveDir:root,sourcefile:'clock-restore-test.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers']});
 const mf=new Miniflare({modules:true,cf:false,d1Databases:{DB:'clock-reset-isolated'},compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
 try{
  const db=await mf.getD1Database('DB');
  for(const name of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort())for(const part of (await fs.readFile(new URL('../drizzle/'+name,import.meta.url),'utf8')).split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(part).run();
  const target='clock-reset',now=Date.now(),base={adventureEngine:'cloud',area:3,district:'lumiose-bleu-plaza',activeId:'keep',teamIds:['keep'],zaClockOffsetHours:3,districtPosition:{revision:5,x:2,y:4},adventureCatchWindow:{revision:5,token:'keep'}};
  const clock=prototypeClockTransition(prototypeClockFromLegacy(base,4,now-2000),4,now-1000,{type:'open',owner:'owner_123456789012345'});
  await db.prepare('INSERT INTO players(user_id,email,name,last_seen) VALUES(?,?,?,?)').bind(target,'reset@example.invalid','Tester',now).run();
  await db.prepare('INSERT INTO worlds(user_id,state,revision,updated_at) VALUES(?,?,?,?)').bind(target,JSON.stringify({...base,zaClockLeasePrototypeV1:clock}),5,now).run();
  await db.prepare('INSERT INTO wallets(user_id,coins) VALUES(?,?)').bind(target,456).run();
  const call=async(method,payload)=>{const r=await mf.dispatchFetch('http://clock.test/',{method:'POST',body:JSON.stringify({method,payload})});return {status:r.status,data:await r.json()};};
  let info=await call('info',{target});assert.equal(info.status,200,JSON.stringify(info.data));
  let reset=await call('reset',{mode:'adventure',target,confirmName:'Tester',expectedHash:info.data.expectedHash});assert.equal(reset.status,200,JSON.stringify(reset.data));
  const backup=await db.prepare('SELECT created_at FROM admin_player_backups WHERE id=?').bind(reset.data.backupId).first();assert.equal(await db.prepare('SELECT state FROM worlds WHERE user_id=?').bind(target).first(),null);
  let restore=await call('restore',{mode:'adventure',target,confirmName:'Tester',backupId:reset.data.backupId});assert.equal(restore.status,200,JSON.stringify(restore.data));
  const row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(target).first(),w=JSON.parse(row.state);assert.equal(row.revision,7);assert.equal(w.zaClockLeasePrototypeV1.revision,7);assert.deepEqual(w.zaClockLeasePrototypeV1.leases,[]);assert.equal(w.zaClockLeasePrototypeV1.pausedMs,prototypeClockProject(clock,backup.created_at).pausedMs);assert.equal(w.districtPosition.revision,7);assert.equal(w.adventureCatchWindow.revision,7);assert.equal(w.activeId,'keep');assert.equal((await db.prepare('SELECT coins FROM wallets WHERE user_id=?').bind(target).first()).coins,456);
  restore=await call('restore',{mode:'adventure',target,confirmName:'Tester',backupId:reset.data.backupId});assert.equal(restore.status,409);
 }finally{await mf.dispose();}
});
