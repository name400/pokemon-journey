import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,classicTransferInventory} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {addClassicFriendship} from '../lib/rogue-classic-growth.mjs';
function setup(existing){const {doc,state,run}=fixture([makeReferenceMon(1,20,{boxId:'one'}),makeReferenceMon(7,20,{boxId:'two'})]);run.modifiers=[{id:'soothebell',boxId:'one',count:1,...existing}];run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(d=>d.id==='soothebell'),rewardId:'bell'}];return {doc,state,run};}
for(const [name,existing] of [['bound',{transferable:false}],['tagged',{originMarker:'keep'}]])test(`reward retains ${name} existing item metadata and can transfer new item`,async()=>{
 let {doc,state,run}=setup(existing);applyClassicAction(doc,{action:'reward',rewardId:'bell',boxId:'one'});let rows=run.modifiers.filter(m=>m.id==='soothebell');assert.equal(rows.length,2);assert.equal(rows.find(r=>Object.keys(existing).every(k=>r[k]===existing[k])).count,1);assert.equal(classicTransferInventory(run,run.party[0]).find(i=>i.id==='soothebell').count,1);
 const bells=rows.filter(r=>r.boxId==='one').reduce((sum,r)=>sum+r.count,0);addClassicFriendship(run.party[0],3,state.system,{sootheBells:bells});assert.equal(run.party[0].friendship,56);
 run.screen='interlude';applyClassicAction(doc,{action:'transferModifier',fromBoxId:'one',toBoxId:'two',id:'soothebell',kind:'modifier',quantity:1});const saved=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(saved).slots[0];rows=run.modifiers.filter(m=>m.id==='soothebell');assert.equal(rows.find(r=>r.boxId==='one').count,1);for(const [key,value] of Object.entries(existing))assert.equal(rows.find(r=>r.boxId==='one')[key],value);assert.equal(rows.find(r=>r.boxId==='two').count,1);assert.deepEqual(saved.adventure,{safe:true});assert.equal(saved.classic.slots[1].id,'other');
});
