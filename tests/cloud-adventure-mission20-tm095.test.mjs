import test from 'node:test';
import assert from 'node:assert/strict';
import {crystalSewerAccessible,crystalSewerTmSpot} from '../lib/cloud-adventure/adventure-mission20-jobs.mjs';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {makeMon} from '../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';

test('sewer TM and reopening require accepted mission and preserve unknown flags',()=>{
 assert.equal(crystalSewerAccessible({zaMission20Stage:8}),false);assert.equal(crystalSewerAccessible({zaMission20Stage:9}),true);assert.equal(crystalSewerAccessible({zaMission20Stage:15}),true);assert.equal(crystalSewerAccessible({zaMission20Complete:true}),true);assert.equal(crystalSewerAccessible({zaMission20Stage:16}),false);
 const s={area:3,district:'lumiose-crystal-sewer',zaMission20Stage:9,x:2,y:1,facing:'up'},spot={tile:'#',x:2,y:0};assert.equal(fieldMap(s)[0][2],'#');assert.equal(crystalSewerTmSpot(s,spot),true);assert.equal(fieldDialogue(s).action,'crystalSewerTm095');for(const v of [true,'future',{version:2}])assert.equal(crystalSewerTmSpot({...s,zaCrystalSewerTm095:v},spot),false);
 const entrance={area:3,district:'lumiose-magenta-canal-route',interior:null,x:10,y:13,facing:'up',zaMission20Complete:true};assert.ok(fieldDialogue(entrance).actions.some(p=>p.action==='mission20CrystalEnter'));
});

test('TM095 covers representative base and verified regional forms without guessing',()=>{
 const bag={'za-tm095':1},mon=id=>({...makeMon(id,40),moves:['몸통박치기']});for(const id of [39,94,150,500,658,10107,10161,10108,10168,10234,10008])assert.equal(canLearnStoryTm(bag,mon(id),'za-tm095'),true,`expected ${id}`);for(const id of [1,25,10172])assert.equal(canLearnStoryTm(bag,mon(id),'za-tm095'),false,`unexpected ${id}`);assert.equal(canLearnStoryTm({},mon(94),'za-tm095'),false);
});

test('northwest sewer Moon Stone is reachable in both layouts and preserves unknown flags',async()=>{
 const {crystalSewerMoonStoneSpot}=await import('../lib/cloud-adventure/adventure-mission20-jobs.mjs');
 for(const layout of [undefined,2]){
  const s={area:3,district:'lumiose-crystal-sewer',zaMagentaSewerLayout:layout,zaMission20Stage:9,x:2,y:3,facing:'up'};
  assert.equal(fieldMap(s)[2][2],'i');assert.equal(fieldDialogue(s).action,'crystalSewerMoonStone');
  for(const v of [true,'future',{version:2}]){const saved={...s,zaCrystalSewerMoonStone:v};assert.equal(crystalSewerMoonStoneSpot(saved,{x:2,y:2,tile:'i'}),false);assert.equal(fieldMap(saved)[2][2],'.');}
  assert.equal(fieldMap({...s,zaMission20Stage:8})[2][2],'.');
 }
});
