import test from 'node:test';
import assert from 'node:assert/strict';
import {recordPlayerCenterVisit,ADVENTURE_PLAYER_BASE_HP} from '../lib/cloud-adventure/adventure-player-vitals.mjs';
import {centerAt} from '../lib/cloud-adventure/adventure-fast-travel.mjs';

test('center visit initializes and recovers versioned player health without changing unrelated save data',()=>{
 const world={area:3,district:'lumiose',interior:null,teamIds:['kept'],zaFastTravelCenters:['hotel'],zaWildShinyRolls:{kept:true}};
 const spot={tile:'H',x:3,y:5},center=centerAt(world,spot),before=structuredClone(world);
 assert.equal(ADVENTURE_PLAYER_BASE_HP,100);assert.equal(recordPlayerCenterVisit(world,center),true);
 assert.deepEqual(world.zaPlayerVitalsV1,{version:1,hp:100,lastCenterId:'hotel'});
 const {zaPlayerVitalsV1,...other}=world;assert.deepEqual(other,before);
 world.zaPlayerVitalsV1={...zaPlayerVitalsV1,hp:30,extra:'keep'};assert.equal(recordPlayerCenterVisit(world,center),true);assert.deepEqual(world.zaPlayerVitalsV1,{version:1,hp:100,lastCenterId:'hotel',extra:'keep'});
 const moved={...world,district:'lumiose-jaune-sector8'};assert.equal(recordPlayerCenterVisit(moved,centerAt(moved,{tile:'H',x:5,y:6})),true);assert.equal(moved.zaPlayerVitalsV1.lastCenterId,'jaune');
});

test('invalid locations and unknown or damaged health schemas are never rewritten',()=>{
 for(const value of [null,[],{version:2,hp:40},{version:1,hp:-1},{version:1,hp:101},{version:1,hp:'40'}]){const world={zaPlayerVitalsV1:value},before=structuredClone(world);assert.equal(recordPlayerCenterVisit(world,{id:'hotel'}),false);assert.deepEqual(world,before);}
 const world={area:3,district:'lumiose',interior:null},before=structuredClone(world);assert.equal(recordPlayerCenterVisit(world,centerAt(world,{tile:'H',x:1,y:1})),false);assert.deepEqual(world,before);
});

test('alpha roar uses 10 HP, leaves one HP before blackout, and preserves unknown state',async()=>{
 const {applyPlayerAlphaRoar}=await import('../lib/cloud-adventure/adventure-player-vitals.mjs');
 const s={zaPlayerVitalsV1:{version:1,hp:100,lastCenterId:'hotel',extra:'kept'}};
 assert.deepEqual(applyPlayerAlphaRoar(s,10000),{blackout:false,damage:10});assert.equal(s.zaPlayerVitalsV1.hp,90);
 s.zaPlayerVitalsV1.hp=5;assert.deepEqual(applyPlayerAlphaRoar(s,12000),{blackout:false,damage:4});assert.equal(s.zaPlayerVitalsV1.hp,1);
 assert.deepEqual(applyPlayerAlphaRoar(s,14000),{blackout:true,damage:1});assert.deepEqual(s.zaPlayerVitalsV1,{version:1,hp:100,lastCenterId:'hotel',extra:'kept',lastDamageAt:14000});
 for(const value of [undefined,null,{version:2,hp:30,lastCenterId:'hotel'},{version:1,hp:0,lastCenterId:'hotel'},{version:1,hp:101,lastCenterId:'hotel'},{version:1,hp:30}]){const w={zaPlayerVitalsV1:value},before=structuredClone(w);assert.equal(applyPlayerAlphaRoar(w),null);assert.deepEqual(w,before);}
});


test('damage immunity and exact fractional recovery protect timing and future schemas',async()=>{
 const {applyPlayerAlphaRoar,syncPlayerVitals,projectPlayerVitals}=await import('../lib/cloud-adventure/adventure-player-vitals.mjs');
 const w={district:'lumiose-wild',zaWildAlphaAlert:true,zaPlayerVitalsV1:{version:1,hp:30,lastCenterId:'hotel'}};
 assert.deepEqual(applyPlayerAlphaRoar(w,10000),{blackout:false,damage:10});assert.equal(w.zaPlayerVitalsV1.hp,20);
 assert.deepEqual(applyPlayerAlphaRoar(w,11999),{immune:true,damage:0,blackout:false});assert.equal(w.zaPlayerVitalsV1.hp,20);
 assert.deepEqual(applyPlayerAlphaRoar(w,12000),{blackout:false,damage:10});assert.equal(w.zaPlayerVitalsV1.hp,10);
 assert.equal(syncPlayerVitals(w,30000),false);w.zaWildAlphaAlert=false;assert.equal(syncPlayerVitals(w,30000),true);
 const before=structuredClone(w);assert.equal(projectPlayerVitals(w,31000).hp,14);assert.deepEqual(w,before);assert.equal(syncPlayerVitals(w,29999),false);assert.deepEqual(w,before);
 for(let t=30200;t<=35000;t+=200)syncPlayerVitals(w,t);assert.equal(w.zaPlayerVitalsV1.hp,31);
 w.combat={};syncPlayerVitals(w,35000);assert.equal(w.zaPlayerVitalsV1.recoveryAt,undefined);assert.equal(projectPlayerVitals(w,50000).hp,31);
 w.combat=null;syncPlayerVitals(w,50000);assert.equal(projectPlayerVitals(w,51000).hp,35);
 const future={zaPlayerVitalsV1:{version:2,hp:2,recoveryAt:0}};assert.equal(syncPlayerVitals(future,50000),false);assert.deepEqual(projectPlayerVitals(future,50000),future.zaPlayerVitalsV1);
});
