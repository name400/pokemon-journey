import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(hardcore=false){const down=makeReferenceMon(4,20,{boxId:'down',friendship:50,moves:['Tackle']}),other=makeReferenceMon(7,20,{boxId:'other',friendship:50,moves:['Tackle']});down.hp=0;const {doc,state,run}=fixture([down,other]);run.challenges=hardcore?[{id:9,value:1}]:[];run.modifiers=[{id:'soothebell',boxId:'down',count:1}];run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='rarecandy'),rewardId:'candy'}];return {doc,state,run};}
test('single rare candy can target a fainted party member without reviving it',async()=>{
 const {doc,state,run}=setup();assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,true);applyClassicAction(doc,{action:'reward',rewardId:'candy',boxId:'down'});assert.equal(run.party[0].level,21);assert.equal(run.party[0].hp,0);assert.equal(run.party[0].friendship,59);assert.equal(state.system.starterData[4].friendshipPoints,27);assert.equal(run.party[1].level,20);
 const saved=await decodeGameData(await encodeGameData(doc)),restored=ensureClassicState(saved);assert.equal(restored.slots[0].party[0].hp,0);assert.equal(restored.slots[0].party[0].level,21);assert.equal(restored.system.starterData[4].friendshipPoints,27);assert.deepEqual(saved.adventure,{safe:true});assert.equal(restored.slots[1].id,'other');
});
test('hardcore challenge continues to reject a fainted target',()=>{
 const {doc,state,run}=setup(true),party=structuredClone(run.party),rewards=structuredClone(run.rewards),system=structuredClone(state.system);assert.equal(classicRewardView(run,state.system)[0].targets[0].eligible,false);assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:'candy',boxId:'down'}));assert.deepEqual(run.party,party);assert.deepEqual(run.rewards,rewards);assert.deepEqual(state.system,system);
});
