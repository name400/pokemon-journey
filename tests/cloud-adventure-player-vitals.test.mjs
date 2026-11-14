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

test('green plush raises the health cap without rewriting injuries or corrupt legacy state',async()=>{
 const {playerMaxHp,syncPlayerVitals,projectPlayerVitals,applyPlayerAlphaRoar}=await import('../lib/cloud-adventure/adventure-player-vitals.mjs');
 for(const [level,max] of [[0,100],[1,150],[2,200],[3,250]]){
  const w={zaGreenCanariLevel:level,zaPlayerVitalsV1:{version:1,hp:100,lastCenterId:'hotel'}};assert.equal(playerMaxHp(w),max);
  recordPlayerCenterVisit(w,{id:'jaune'});assert.equal(w.zaPlayerVitalsV1.hp,max);assert.equal(w.zaPlayerVitalsV1.lastCenterId,'jaune');
  w.zaPlayerVitalsV1.hp=1;assert.deepEqual(applyPlayerAlphaRoar(w,5000),{blackout:true,damage:1});assert.equal(w.zaPlayerVitalsV1.hp,max);
 }
 const w={zaGreenCanariLevel:3,zaPlayerVitalsV1:{version:1,hp:100,lastCenterId:'hotel'}};syncPlayerVitals(w,1000);assert.equal(projectPlayerVitals(w,61000).hp,250);assert.equal(w.zaPlayerVitalsV1.hp,100);
 const damaged={zaGreenCanariLevel:2,zaPlayerVitalsV1:{version:1,hp:175,lastCenterId:'hotel'}};assert.deepEqual(applyPlayerAlphaRoar(damaged,5000),{blackout:false,damage:10});assert.equal(damaged.zaPlayerVitalsV1.hp,165);
 const future={zaGreenCanariLevel:9,zaPlayerVitalsV1:{version:1,hp:150,lastCenterId:'hotel'}},before=structuredClone(future);assert.equal(playerMaxHp(future),null);assert.equal(syncPlayerVitals(future,5000),false);assert.equal(recordPlayerCenterVisit(future,{id:'jaune'}),false);assert.equal(applyPlayerAlphaRoar(future,5000),null);assert.deepEqual(future,before);
});

test('roof alpha alert stops recovery only while that alpha remains present',async()=>{
 const {syncPlayerVitals,projectPlayerVitals}=await import('../lib/cloud-adventure/adventure-player-vitals.mjs');
 const w={district:'lumiose-zone1-roof',zaZone1RoofRoarAlert:true,zaPlayerVitalsV1:{version:1,hp:30,lastCenterId:'hotel'}};
 assert.equal(syncPlayerVitals(w,1000),false);w.zaZone1RoofAlphaSpent=true;assert.equal(syncPlayerVitals(w,2000),true);assert.equal(projectPlayerVitals(w,3000).hp,34);
});

test('wild attack damage shares the roar protection and rejects invalid amounts',async()=>{
 const {applyPlayerWildDamage,applyPlayerAlphaRoar}=await import('../lib/cloud-adventure/adventure-player-vitals.mjs');
 const w={zaPlayerVitalsV1:{version:1,hp:60,lastCenterId:'hotel'}};
 for(const damage of [0,-1,1.5,Infinity])assert.equal(applyPlayerWildDamage(w,damage,1000),null);
 assert.deepEqual(applyPlayerWildDamage(w,30,1000),{blackout:false,damage:30});
 assert.equal(applyPlayerAlphaRoar(w,2999).immune,true);assert.deepEqual(applyPlayerWildDamage(w,30,3000),{blackout:false,damage:29});
 assert.deepEqual(applyPlayerWildDamage(w,30,5000),{blackout:true,damage:1});assert.equal(w.zaPlayerVitalsV1.hp,100);
});
