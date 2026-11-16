import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureClockOffset,adventureGameTime,adventureSpawnInterval,restUntilHour,syncAdventureCombatClock} from '../lib/cloud-adventure/adventure-clock.mjs';
import {royaleNightIndex} from '../lib/cloud-adventure/adventure-royale-zones.mjs';
const hour=50000;
test('combat clock freezes across midnight, reload and battle end without changing legacy rest hours',()=>{
 let now=23*hour;const state={combat:{},zaClockOffsetHours:0};syncAdventureCombatClock(state,now);
 const initial=adventureGameTime(now,adventureClockOffset(state,now)),night=royaleNightIndex(state,now),spawn=adventureSpawnInterval(now,adventureClockOffset(state,now));
 now+=10*hour;const restored=JSON.parse(JSON.stringify(state));assert.deepEqual(adventureGameTime(now,adventureClockOffset(restored,now)),initial);assert.equal(royaleNightIndex(restored,now),night);assert.equal(adventureSpawnInterval(now,adventureClockOffset(restored,now)),spawn);
 delete restored.combat;syncAdventureCombatClock(restored,now);assert.equal(restored.zaClockPausedMs,10*hour);assert.equal(restored.zaClockPauseStartedAt,undefined);assert.equal(restored.zaClockOffsetHours,0);assert.deepEqual(adventureGameTime(now,adventureClockOffset(restored,now)),initial);
 now+=6*hour;assert.equal(adventureGameTime(now,adventureClockOffset(restored,now)).period,'day');restUntilHour(restored,5,20);assert.equal(restored.zaClockOffsetHours,15);assert.equal(adventureGameTime(now,adventureClockOffset(restored,now)).hour,20);
});
test('legacy and invalid metadata are preserved safely without inventing previous paused time',()=>{
 const old={combat:{},zaClockOffsetHours:2};assert.equal(adventureClockOffset(old,100000),2);syncAdventureCombatClock(old,100000);assert.equal(old.zaClockPauseStartedAt,100000);delete old.combat;syncAdventureCombatClock(old,125000);assert.equal(old.zaClockPausedMs,25000);assert.equal(adventureClockOffset(old,125000),1.5);
 const future={combat:{},zaClockPauseStartedAt:200000,zaClockPausedMs:-1};assert.equal(adventureClockOffset(future,100000),0);delete future.combat;syncAdventureCombatClock(future,100000);assert.equal(future.zaClockPausedMs,0);
});
test('known building interiors pause across reload, combat and exit without changing saved rest hours',()=>{
 let now=19*hour;const s={area:3,interior:'hotel',zaClockOffsetHours:2,custom:{keep:true}};syncAdventureCombatClock(s,now);
 const time=adventureGameTime(now,adventureClockOffset(s,now)),spawn=adventureSpawnInterval(now,adventureClockOffset(s,now));
 now+=3*hour;const restored=JSON.parse(JSON.stringify(s));restored.interior='hotel202';syncAdventureCombatClock(restored,now);restored.combat={};now+=hour;syncAdventureCombatClock(restored,now);delete restored.combat;syncAdventureCombatClock(restored,now);
 assert.deepEqual(adventureGameTime(now,adventureClockOffset(restored,now)),time);assert.equal(adventureSpawnInterval(now,adventureClockOffset(restored,now)),spawn);
 restored.interior=null;syncAdventureCombatClock(restored,now);assert.equal(restored.zaClockPausedMs,4*hour);assert.equal(restored.zaClockPauseStartedAt,undefined);assert.equal(restored.zaClockOffsetHours,2);assert.deepEqual(restored.custom,{keep:true});
 now+=hour;assert.equal(adventureGameTime(now,adventureClockOffset(restored,now)).hour,(time.hour+1)%24);
});
test('rooftops and unrecognized or non-city interiors do not start an indoor pause',()=>{
 for(const state of [{area:3,interior:'hotelRoof'},{area:3,interior:'future-unknown'},{area:1,interior:'hotel'}]){syncAdventureCombatClock(state,100000);assert.equal(state.zaClockPauseStartedAt,undefined);}
});
