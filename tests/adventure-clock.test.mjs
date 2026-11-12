import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureClockTime,nextAdventureHourDelay} from '../lib/adventure-clock.mjs';
import {gameTime,evolutionOptions} from '../lib/evolution.mjs';
import {makeMon} from '../lib/game.mjs';
import {adventureClockOffset,restUntilHour} from '../lib/cloud-adventure/adventure-clock.mjs';

test('display clock matches server time at hour, day and moon boundaries',()=>{
 for(const day of [0,13,14,15,27,28])for(let hour=0;hour<24;hour++)for(const offset of [0,49999]){
  const now=day*1200000+hour*50000+offset;assert.deepEqual(adventureClockTime(now),gameTime(now));
 }
 assert.ok(nextAdventureHourDelay(123499)>0);assert.ok(nextAdventureHourDelay(149999)<=150);
});

test('cloud rest advances the personal clock across day and moon boundaries',()=>{
 const now=13*1200000+23*50000+1234,s={};restUntilHour(s,gameTime(now).hour,8);
 assert.equal(adventureClockOffset(s),9);assert.deepEqual(gameTime(now,adventureClockOffset(s)),{hour:8,period:'day',dusk:false,fullMoon:true});
 restUntilHour(s,8,20);assert.equal(adventureClockOffset(s),21);assert.equal(gameTime(now,adventureClockOffset(s)).period,'night');
 assert.equal(adventureClockOffset({zaClockOffsetHours:-1}),0);assert.equal(adventureClockOffset({zaClockOffsetHours:'9'}),0);assert.throws(()=>restUntilHour(s,25,20));
});

test('cloud evolution checks the same personal time without changing other modes',()=>{
 const oldNow=Date.now;Date.now=()=>12*50000;
 try{const mon=makeMon(133,20);mon.friendship=255;const find=world=>evolutionOptions(mon,world).filter(x=>[196,197].includes(x.id));
  assert.equal(find({adventureEngine:'cloud'}).find(x=>x.id===196).ready,true);
  assert.equal(find({adventureEngine:'cloud',zaClockOffsetHours:8}).find(x=>x.id===197).ready,true);
  assert.equal(find({mode:'rogue',zaClockOffsetHours:8}).find(x=>x.id===196).ready,true);
 }finally{Date.now=oldNow;}
});

test('cloud clock uses Z-A day, night and dusk boundaries without changing other clocks',async()=>{
 const {adventureGameTime,adventureSpawnInterval}=await import('../lib/cloud-adventure/adventure-clock.mjs'),h=50000;
 for(const [hour,period,dusk] of [[3,'night',false],[4,'day',false],[15,'day',false],[16,'day',true],[19,'day',true],[20,'night',false],[23,'night',false]]){const t=adventureGameTime(hour*h);assert.equal(t.period,period);assert.equal(t.dusk,dusk);}
 assert.equal(gameTime(5*h).period,'night');assert.equal(adventureGameTime(5*h).period,'day');assert.equal(gameTime(19*h).period,'night');assert.equal(adventureGameTime(19*h).period,'day');
 assert.equal(adventureSpawnInterval(4*h-1),-1);assert.equal(adventureSpawnInterval(4*h),0);assert.equal(adventureSpawnInterval(20*h-1),0);assert.equal(adventureSpawnInterval(20*h),1);assert.equal(adventureSpawnInterval(28*h),2);assert.deepEqual(adventureGameTime(19*h,1),adventureGameTime(20*h));
 const oldNow=Date.now;try{const mon=makeMon(133,20);mon.friendship=255;const options=()=>evolutionOptions(mon,{adventureEngine:'cloud'});Date.now=()=>5*h;assert.equal(options().find(x=>x.id===196).ready,true);Date.now=()=>18*h;assert.equal(options().find(x=>x.id===196).ready,false);assert.equal(options().find(x=>x.id===197).ready,false);Date.now=()=>21*h;assert.equal(options().find(x=>x.id===197).ready,true);}finally{Date.now=oldNow;}
});

test('legacy spawn cycles are rebased once without losing wild or player progress',async()=>{
 const {migrateAdventureWildClock}=await import('../lib/cloud-adventure/adventure-clock.mjs');const s={zaClockOffsetHours:8,zaWildSpawnCycles:{5:{period:'night',interval:123},6:{period:'day',interval:124}},zaZone19SpawnCycle:{period:'night',interval:123},zaZone5Spent:{abra:true},zaWildShinyRolls:{'zone5:other:1':true},teamIds:['kept']};
 assert.equal(migrateAdventureWildClock(s,'day',900),true);assert.equal(s.zaWildSpawnCycles[5].interval,900);assert.equal(s.zaZone19SpawnCycle.period,'day');assert.equal(s.zaZone5Spent.abra,true);assert.equal(s.zaWildShinyRolls['zone5:other:1'],true);assert.deepEqual(s.teamIds,['kept']);assert.equal(s.zaClockOffsetHours,8);assert.equal(migrateAdventureWildClock(s,'night',901),false);assert.equal(s.zaZone19SpawnCycle.interval,900);
 const inBattle={combat:{},zaZone5Spent:{abra:true}};assert.equal(migrateAdventureWildClock(inBattle,'day',900),false);assert.equal(inBattle.zaWildClockV2,undefined);
});
