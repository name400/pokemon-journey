// Real admin mutation and isolated D1 only; no account or deployed database is used.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {makeMon} from '../lib/game.mjs';
import {prototypeClockFromLegacy,prototypeClockTransition} from '../lib/cloud-adventure/adventure-clock-lease-prototype.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
test('admin grant and edit atomically advance experimental clock and retain legacy saves',async()=>{
 const bundle=await build({stdin:{contents:`import {mutateAdminPokemon} from './lib/admin-mutations.ts';export default {async fetch(req){globalThis.__adventureClockLeaseTestOnly=true;const {body,mon}=await req.json();try{return Response.json(await mutateAdminPokemon('isolated-admin',body,mon));}catch(e){return Response.json({error:String(e)},{status:409});}}}`,resolveDir:root,sourcefile:'clock-admin-test.ts'},bundle:true,write:false,format:'esm',platform:'node',target:'node22',alias:{'@':root},external:['cloudflare:workers']});
 const mf=new Miniflare({modules:true,cf:false,d1Databases:{DB:'clock-admin-isolated'},compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],script:bundle.outputFiles[0].text});
 try{
  const db=await mf.getD1Database('DB');
  for(const name of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort())for(const part of (await fs.readFile(new URL('../drizzle/'+name,import.meta.url),'utf8')).split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(part).run();
  const target='clock-admin-isolated',now=Date.now(),base={adventureEngine:'cloud',area:3,district:'lumiose-bleu-plaza',teamIds:['lead'],activeId:'lead',zaClockOffsetHours:3};
  const clock=prototypeClockTransition(prototypeClockFromLegacy(base,4,now-1000),4,now-500,{type:'open',owner:'owner_123456789012345'});
  await db.prepare('INSERT INTO players(user_id,email,name,last_seen) VALUES(?,?,?,?)').bind(target,'isolated@example.invalid','test',now).run();
  await db.prepare('INSERT INTO worlds(user_id,state,revision,updated_at) VALUES(?,?,?,?)').bind(target,JSON.stringify({...base,zaClockLeasePrototypeV1:clock}),5,now).run();
  const mon=makeMon(25,10),call=async body=>{const r=await mf.dispatchFetch('http://clock.test/',{method:'POST',body:JSON.stringify({body:{mode:'adventure',target,...body},mon})});return {status:r.status,data:await r.json()};};
  let r=await call({action:'grantPokemon'});assert.equal(r.status,200,JSON.stringify(r.data));const granted=r.data.boxId;
  let row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(target).first(),world=JSON.parse(row.state);assert.equal(row.revision,6);assert.equal(world.zaClockLeasePrototypeV1.revision,6);assert.equal(world.zaClockLeasePrototypeV1.leases.length,0);assert.equal(world.activeId,'lead');assert.ok(await db.prepare('SELECT id FROM pokemon_box WHERE id=? AND user_id=?').bind(granted,target).first());
  r=await call({action:'editPokemon',boxId:granted});assert.equal(r.status,200,JSON.stringify(r.data));row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(target).first();world=JSON.parse(row.state);assert.equal(row.revision,7);assert.equal(world.zaClockLeasePrototypeV1.revision,7);
  // Mismatched clock revision fails before issuing or editing any Pokemon.
  await db.prepare('UPDATE worlds SET revision=revision+1 WHERE user_id=?').bind(target).run();const before=(await db.prepare('SELECT COUNT(*) AS n FROM pokemon_box WHERE user_id=?').bind(target).first()).n;r=await call({action:'grantPokemon'});assert.equal(r.status,409);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM pokemon_box WHERE user_id=?').bind(target).first()).n,before);
  await db.prepare('UPDATE worlds SET state=?,revision=? WHERE user_id=?').bind(JSON.stringify(base),12,target).run();r=await call({action:'grantPokemon'});assert.equal(r.status,200);row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(target).first();assert.equal(row.revision,13);assert.equal(JSON.parse(row.state).zaClockLeasePrototypeV1,undefined);
 }finally{await mf.dispose();}
});
