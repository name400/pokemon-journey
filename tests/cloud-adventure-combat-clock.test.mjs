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
test('known sewer maps pause as one interval while entrance routes remain outside',()=>{
 let now=19*hour;const s={area:3,district:'lumiose-bleu3-sewer-approach',interior:null,zaClockOffsetHours:3,zaSewerReturn:'bleu3'};syncAdventureCombatClock(s,now);assert.equal(s.zaClockPauseStartedAt,undefined);
 s.district='lumiose-sewer';syncAdventureCombatClock(s,now);const initial=adventureGameTime(now,adventureClockOffset(s,now)),spawn=adventureSpawnInterval(now,adventureClockOffset(s,now));
 now+=2*hour;const saved=JSON.parse(JSON.stringify(s));saved.zaMission19Inner=true;syncAdventureCombatClock(saved,now);saved.combat={};syncAdventureCombatClock(saved,now);now+=hour;delete saved.combat;saved.zaSewerIceBranch=true;syncAdventureCombatClock(saved,now);
 assert.deepEqual(adventureGameTime(now,adventureClockOffset(saved,now)),initial);assert.equal(adventureSpawnInterval(now,adventureClockOffset(saved,now)),spawn);assert.equal(saved.zaSewerReturn,'bleu3');
 saved.district='lumiose-crystal-sewer';now+=hour;syncAdventureCombatClock(saved,now);assert.equal(saved.zaClockPauseStartedAt,19*hour);
 saved.district='lumiose-bleu3-sewer-approach';syncAdventureCombatClock(saved,now);assert.equal(saved.zaClockPauseStartedAt,undefined);assert.equal(saved.zaClockPausedMs,4*hour);assert.equal(saved.zaClockOffsetHours,3);now+=hour;assert.equal(adventureGameTime(now,adventureClockOffset(saved,now)).hour,(initial.hour+1)%24);
});
test('old sewer saves begin pausing on the next saved action without inventing elapsed time',()=>{
 const saved={area:3,district:'lumiose-sewer',interior:null,zaClockOffsetHours:4,zaMission19Stage:12,zaMission19Inspected:['a','b']};
 assert.equal(adventureClockOffset(saved,200000),4);syncAdventureCombatClock(saved,200000);assert.equal(saved.zaClockPauseStartedAt,200000);assert.equal(saved.zaClockPausedMs,undefined);assert.deepEqual(saved.zaMission19Inspected,['a','b']);assert.equal(saved.zaMission19Stage,12);
 saved.district='lumiose-bleu3-sewer-approach';syncAdventureCombatClock(saved,250000);assert.equal(saved.zaClockPausedMs,50000);assert.equal(saved.zaClockOffsetHours,4);
});
