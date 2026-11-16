import test from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import {prototypeWorldClock,preparePrototypeWorldTransition,savePrototypeWorldClock} from '../lib/cloud-adventure/adventure-clock-world-prototype.mjs';
import {adventureClockOffset} from '../lib/cloud-adventure/adventure-clock.mjs';

const A='aaaaaaaaaaaaaaaa',B='bbbbbbbbbbbbbbbb';
const base=()=>({area:3,district:'lumiose-zone1',activeId:'owned',teamIds:['owned'],zaClockOffsetHours:2,zaClockPausedMs:5000,districtPosition:{x:4,y:5,revision:7},interiorPosition:{interior:'future',revision:3},adventureCatchWindow:{revision:7,foe:{speciesId:25,hp:1}},unknown:{preserve:true}});

test('real-shaped worlds CAS retains catch window and positions through expiry, fencing and stale requests',async()=>{
 const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:{DB:'clock-world-isolated'},compatibilityDate:'2026-05-15'});
 try{
  const db=await mf.getD1Database('DB');await db.prepare('CREATE TABLE worlds (user_id TEXT PRIMARY KEY NOT NULL,state TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,updated_at INTEGER NOT NULL)').run();
  const original=base();await db.prepare('INSERT INTO worlds VALUES(?,?,?,?)').bind('synthetic',JSON.stringify(original),7,100000).run();
  const [x,y]=await Promise.allSettled([savePrototypeWorldClock(db,'synthetic',7,100000,{type:'open',owner:A}),savePrototypeWorldClock(db,'synthetic',7,100000,{type:'open',owner:B})]);
  assert.equal([x,y].filter(r=>r.status==='fulfilled').length,1);assert.equal([x,y].filter(r=>r.status==='rejected').length,1);
  let row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('synthetic').first(),s=JSON.parse(row.state);
  assert.equal(row.revision,8);assert.equal(s.adventureCatchWindow.revision,8);assert.equal(s.districtPosition.revision,8);assert.equal(s.interiorPosition.revision,3);assert.deepEqual(s.unknown,original.unknown);assert.deepEqual(s.teamIds,original.teamIds);assert.deepEqual(s.adventureCatchWindow.foe,original.adventureCatchWindow.foe);
  const owner=s.zaClockLeasePrototypeV1.leases[0].owner,generation=s.zaClockLeasePrototypeV1.leases[0].generation;
  assert.equal(prototypeWorldClock(s,8,130000).pausedMs,25000);
  await assert.rejects(savePrototypeWorldClock(db,'synthetic',8,130000,{type:'renew',owner,generation}),/expired/);
  row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('synthetic').first();assert.equal(row.revision,8);
  const fenced=await savePrototypeWorldClock(db,'synthetic',8,130000,{type:'fence'});assert.equal(fenced.state.adventureCatchWindow.revision,9);assert.equal(fenced.state.districtPosition.revision,9);
  await assert.rejects(savePrototypeWorldClock(db,'synthetic',8,130001,{type:'open',owner:A}),/revision/);
  const reopened=await savePrototypeWorldClock(db,'synthetic',9,130001,{type:'open',owner:A});assert.equal(reopened.state.adventureCatchWindow.revision,10);
  const field=await savePrototypeWorldClock(db,'synthetic',10,130002,{type:'field'});assert.deepEqual(field.state.zaClockLeasePrototypeV1.leases,[]);assert.equal(field.state.adventureCatchWindow.revision,11);
  // Mirror the production fence's atomic revision-only handling for a known
  // experimental clock; no time or ownership changes during recovery.
  const paths=['$.districtPosition.revision','$.interiorPosition.revision','$.adventureCatchWindow.revision'];let expr='state';for(const path of paths)expr=`CASE WHEN json_type(state,'${path}')='integer' AND json_extract(state,'${path}')=revision THEN json_set(${expr},'${path}',revision+1) ELSE ${expr} END`;
  expr=`CASE WHEN json_extract(state,'$.zaClockLeasePrototypeV1.version')=1 AND json_type(state,'$.zaClockLeasePrototypeV1.revision')='integer' AND json_extract(state,'$.zaClockLeasePrototypeV1.revision')=revision THEN json_set(${expr},'$.zaClockLeasePrototypeV1.revision',revision+1) ELSE ${expr} END`;
  const fence=await db.prepare(`UPDATE worlds SET state=${expr},revision=revision+1,updated_at=? WHERE user_id=? AND revision=?`).bind(130003,'synthetic',11).run();assert.equal(fence.meta.changes,1);
  const afterFence=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind('synthetic').first(),coordinated=JSON.parse(afterFence.state);
  assert.equal(coordinated.adventureCatchWindow.revision,12);assert.equal(coordinated.districtPosition.revision,12);assert.equal(coordinated.zaClockLeasePrototypeV1.revision,12);assert.equal(prototypeWorldClock(coordinated,12,130003).paused,false);
  const after=await savePrototypeWorldClock(db,'synthetic',12,130003,{type:'open',owner:B});assert.equal(after.state.adventureCatchWindow.revision,13);
  assert.deepEqual(original,base());
 }finally{await mf.dispose();}
});

test('fixed transitions share the same timeline and preserve original worlds',()=>{
 const before=base(),snapshot=structuredClone(before),start=100000;
 assert.equal(prototypeWorldClock(before,7,start).offsetHours,adventureClockOffset(before,start));
 const indoor={...structuredClone(before),interior:'hotel'};
 let a=preparePrototypeWorldTransition(before,indoor,7,110000,{field:true});assert.equal(prototypeWorldClock(a,8,120000).pausedMs,15000);
 const wild={...structuredClone(a),interior:null,combat:{adventureWildClockRunsV1:true}};
 let b=preparePrototypeWorldTransition(a,wild,8,120000,{field:true});assert.equal(prototypeWorldClock(b,9,130000).pausedMs,15000);
 const trainer={...structuredClone(b),combat:{}};let c=preparePrototypeWorldTransition(b,trainer,9,130000);assert.equal(prototypeWorldClock(c,10,140000).pausedMs,25000);
 assert.deepEqual(before,snapshot);assert.equal(c.adventureCatchWindow.revision,10);assert.deepEqual(c.adventureCatchWindow.foe,snapshot.adventureCatchWindow.foe);
 assert.throws(()=>preparePrototypeWorldTransition(c,{...c,zaClockOffsetHours:3},10,140000),/clock edit/);
 assert.throws(()=>prototypeWorldClock({...c,combat:null},10,140000),/fixed state/);
 assert.throws(()=>prototypeWorldClock(c,11,140000),/revision/);
});
