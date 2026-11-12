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
