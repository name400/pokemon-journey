import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureClockOffset,adventureGameTime,adventureSpawnInterval,syncAdventureCombatClock} from '../lib/cloud-adventure/adventure-clock.mjs';
import {CLOCK_LEASE_MS,prototypeClockFromLegacy as init,prototypeClockProject as project,prototypeClockTransition as transition} from '../lib/cloud-adventure/adventure-clock-lease-prototype.mjs';

const A='aaaaaaaaaaaaaaaa',B='bbbbbbbbbbbbbbbb';
const step=(s,now,c)=>transition(s,s.revision,now,c);
const open=(s,now,owner)=>step(s,now,{type:'open',owner});
const gen=(s,owner)=>s.leases.find(x=>x.owner===owner).generation;

test('legacy clock baseline is read without changing saved progress, items or time',()=>{
 for(const w of [{area:3,district:'lumiose-zone1',zaClockOffsetHours:3,zaClockPausedMs:1000},{area:3,interior:'hotel',zaClockOffsetHours:2,zaClockPausedMs:1000,zaClockPauseStartedAt:50000},{area:3,district:'lumiose-sewer',combat:{adventureWildClockRunsV1:true},zaClockPauseStartedAt:50000},{area:3,district:'lumiose-zone1',combat:{adventureWildClockRunsV1:true}}]){
  const original=structuredClone({...w,teamIds:['kept'],bag:{stone:1}}),copy=structuredClone(original),now=100000,s=init(original,42,now);
  assert.deepEqual(original,copy);assert.equal(project(s,now).offsetHours,adventureClockOffset(original,now));assert.equal(s.revision,42);
  assert.deepEqual(adventureGameTime(now,project(s,now).offsetHours),adventureGameTime(now,adventureClockOffset(original,now)));
  assert.equal(adventureSpawnInterval(now,project(s,now).offsetHours),adventureSpawnInterval(now,adventureClockOffset(original,now)));
 }
 assert.throws(()=>init({zaClockPausedMs:-1},1,10));
});

test('overlapping tabs pause once, close independently and expire after disconnect',()=>{
 let s=init({},0,100000);s=open(s,100000,A);const a=gen(s,A);s=open(s,105000,B);const b=gen(s,B);
 assert.equal(project(s,110000).pausedMs,10000);
 s=step(s,110000,{type:'close',owner:A,generation:a});assert.equal(project(s,120000).pausedMs,20000);
 assert.equal(project(s,130000).pausedMs,25000);assert.equal(project(s,130000).paused,false);
 const snapshot=JSON.parse(JSON.stringify(s));assert.deepEqual(project(snapshot,130000),project(s,130000));
 assert.throws(()=>step(snapshot,130000,{type:'renew',owner:B,generation:b}),/expired/);assert.deepEqual(snapshot,JSON.parse(JSON.stringify(s)));
});

test('fixed indoor and battle time overlap leases as a union, including boundary exit',()=>{
 const legacy={area:3,interior:'hotel',zaClockOffsetHours:2};syncAdventureCombatClock(legacy,100000);let s=init(legacy,9,100000);
 s=open(s,105000,A);s=step(s,110000,{type:'fixed',paused:false});assert.equal(project(s,125000).pausedMs,25000);
 assert.equal(project(s,130000).pausedMs,25000);s=step(s,130000,{type:'fixed',paused:true});
 assert.equal(project(s,150000).pausedMs,45000);s=step(s,150000,{type:'fixed',paused:false});assert.equal(project(s,155000).pausedMs,45000);
});

test('revisions, generations and field action fence stale updates and protect inputs',()=>{
 let s=open(init({},1,0),0,A);const old=gen(s,A),before=structuredClone(s);
 assert.throws(()=>transition(s,1,1000,{type:'close',owner:A,generation:old}),/revision/);assert.deepEqual(s,before);
 s=open(s,1000,A);const current=gen(s,A);assert.notEqual(current,old);
 assert.throws(()=>step(s,2000,{type:'close',owner:A,generation:old}),/stale/);
 s=open(s,2000,B);s=step(s,3000,{type:'field'});assert.equal(s.leases.length,0);assert.throws(()=>step(s,4000,{type:'renew',owner:A,generation:current}),/stale/);
 const reopened=open(s,5000,A);assert.notEqual(gen(reopened,A),current);assert.equal(project(reopened,5000+CLOCK_LEASE_MS+1).paused,false);
 assert.throws(()=>step(reopened,4999,{type:'field'}),/invalid/);assert.throws(()=>step(reopened,6000,{type:'open',owner:'bad'}),/owner/);
});

test('renewal and ownership limits do not extend expired or malformed leases',()=>{
 let s=open(init({},0,0),0,A),g=gen(s,A);s=step(s,10000,{type:'renew',owner:A,generation:g});
 assert.equal(project(s,30000).pausedMs,30000);assert.equal(project(s,30000).paused,false);
 assert.throws(()=>step(s,30000,{type:'renew',owner:A,generation:g}),/expired/);
 const malformed={...s,leases:[{...s.leases[0],until:s.at+CLOCK_LEASE_MS+1}]};assert.throws(()=>project(malformed,30000),/invalid/);
 let full=init({},0,0);for(let i=0;i<8;i++)full=open(full,0,`owner___________${i}`);const before=structuredClone(full);
 assert.throws(()=>open(full,0,'owner___________8'),/many/);assert.deepEqual(full,before);
});

test('wild combat runs outdoors but legacy and indoor combat use the existing fixed policy',()=>{
 for(const [w,fixed] of [[{area:3,district:'lumiose-zone1',combat:{adventureWildClockRunsV1:true}},false],[{area:3,district:'lumiose-zone1',combat:{}},true],[{area:3,district:'lumiose-sewer',combat:{adventureWildClockRunsV1:true}},true],[{area:3,interior:'hotelRoof'},false]])assert.equal(init(w,0,1000).fixed,fixed);
});

test('isolated D1 compare-and-swap commits one of two simultaneous opens',async()=>{
 const {Miniflare}=await import('miniflare');const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:{DB:'clock-lease-isolated'},compatibilityDate:'2026-05-15'});
 try{
  const db=await mf.getD1Database('DB');await db.prepare('CREATE TABLE clock_state (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, state TEXT NOT NULL)').run();
  const base=init({area:3,district:'lumiose-zone1'},0,100000);await db.prepare('INSERT INTO clock_state VALUES (?, ?, ?)').bind('test',0,JSON.stringify(base)).run();
  const first=open(base,100000,A),second=open(base,100000,B);
  const save=x=>db.prepare('UPDATE clock_state SET revision=?,state=? WHERE id=? AND revision=?').bind(x.revision,JSON.stringify(x),'test',base.revision).run();
  const results=await Promise.all([save(first),save(second)]);assert.equal(results.reduce((n,r)=>n+r.meta.changes,0),1);
  const row=await db.prepare('SELECT revision,state FROM clock_state WHERE id=?').bind('test').first(),stored=JSON.parse(row.state);
  assert.equal(row.revision,1);assert.equal(stored.leases.length,1);assert.equal(project(stored,125000).pausedMs,CLOCK_LEASE_MS);
  const loser=stored.leases[0].owner===A?B:A;assert.throws(()=>transition(stored,0,125000,{type:'open',owner:loser}),/revision/);
 }finally{await mf.dispose();}
});
