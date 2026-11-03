import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {chooseClassicProbeAction} from '../scripts/classic-probe-policy.mjs';
for(const [type,expected] of [['fun-and-games','leave'],['a-trainers-test','rest']]){
 const doc={},state=ensureClassicState(doc),run={id:'probe',seed:'x',rng:42,wave:122,biome:4,screen:'mystery',mysteryRule:'part-timer-v18',party:[makeReferenceMon(151,80,{boxId:'hero',moves:['Tackle']})],modifiers:[],tools:{},balls:{},money:100000,encounter:{kind:'mystery',key:type},mystery:{type,stage:'choose',trainerId:121},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[]};state.slots[0]=run;assert.deepEqual(chooseClassicProbeAction(doc),{action:'mysterySelect',job:expected});
}
