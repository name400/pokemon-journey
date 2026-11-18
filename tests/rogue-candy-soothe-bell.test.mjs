import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const mon=(id,boxId,friendship=50)=>makeReferenceMon(id,20,{boxId,friendship,moves:['Tackle']});
const reward=(run,id)=>{run.screen='reward';run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id===id),rewardId:'candy-test'}];};
test('targeted rare candy applies only the selected Pokémon’s bells and survives save',async()=>{
 let {doc,state,run}=fixture([mon(1,'a',198),mon(4,'b')]);run.modifiers=[{id:'soothebell',boxId:'a',count:1},{id:'soothebell',boxId:'b',count:2},{id:'candyjar',boxId:null,count:1}];reward(run,'rarecandy');
 applyClassicAction(doc,{action:'reward',rewardId:'candy-test',boxId:'a'});
 assert.equal(run.party[0].friendship,200);assert.equal(run.party[1].friendship,50);assert.equal(state.system.starterData[1].friendshipPoints,27);assert.equal(state.system.starterData[4]?.friendshipPoints||0,0);assert.equal(run.party[0].level,22);
 doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);assert.equal(state.system.starterData[1].friendshipPoints,27);assert.equal(state.slots[0].party[0].friendship,200);assert.deepEqual(doc.adventure,{safe:true});assert.equal(state.slots[1].id,'other');
});
test('party candy applies each holder’s bells, including a fainted fusion',async()=>{
 const fusion=previewClassicDnaFusion(mon(1,'a'),mon(4,'donor'),{random:()=>0}).fused,{doc,state,run}=fixture([fusion,mon(7,'b'),mon(25,'c')]);run.party[0].hp=0;run.modifiers=[{id:'soothebell',boxId:'a',count:2},{id:'soothebell',boxId:'b',count:1}];reward(run,'rarercandy');
 applyClassicAction(doc,{action:'reward',rewardId:'candy-test'});
 assert.deepEqual(run.party.map(p=>p.friendship),[62,59,56]);assert.equal(run.party[0].hp,0);assert.equal(state.system.starterData[1].friendshipPoints,18);assert.equal(state.system.starterData[4].friendshipPoints,18);assert.equal(state.system.starterData[7].friendshipPoints,27);assert.equal(state.system.starterData[172].friendshipPoints,18);assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:'candy-test'}));
 const saved=await decodeGameData(await encodeGameData(doc)),restored=ensureClassicState(saved);assert.deepEqual(restored.slots[0].party.map(p=>p.friendship),[62,59,56]);assert.equal(restored.system.starterData[4].friendshipPoints,18);assert.equal(restored.slots[0].party[0].hp,0);assert.deepEqual(saved.adventure,{safe:true});
});
