import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {addClassicFriendship} from '../lib/rogue-classic-growth.mjs';
import {starterProgress,starterDexEntry,reduceStarterCost} from '../lib/rogue-starter-system.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';

test('full candy wallet preserves nearly earned candy across save and actual spending',async()=>{
 const {doc,state,run}=fixture([makeReferenceMon(1,20,{boxId:'cap',friendship:50})]),progress=starterProgress(state.system,1);starterDexEntry(state.system,1).registered=true;progress.candies=9999;progress.friendshipPoints=74;
 addClassicFriendship(run.party[0],3,state.system);assert.equal(progress.candies,9999);assert.equal(progress.friendshipPoints,74);
 const saved=await decodeGameData(await encodeGameData(doc)),restored=ensureClassicState(saved),wallet=starterProgress(restored.system,1);reduceStarterCost(restored.system,1);assert.equal(wallet.candies,9979);addClassicFriendship(restored.slots[0].party[0],1,restored.system);assert.equal(wallet.candies,9980);assert.equal(wallet.friendshipPoints,2);assert.deepEqual(saved.adventure,{safe:true});assert.equal(restored.slots[1].id,'other');
});
test('starting below the cap retains normal rounding while reaching it',()=>{
 const {state,run}=fixture([makeReferenceMon(1,20,{boxId:'cap',friendship:50})]),progress=starterProgress(state.system,1);progress.candies=9998;progress.friendshipPoints=74;addClassicFriendship(run.party[0],3,state.system);assert.equal(progress.candies,9999);assert.equal(progress.friendshipPoints,8);
});
test('a capped fusion family does not block the other family',()=>{
 const primary=makeReferenceMon(1,20,{boxId:'primary'}),donor=makeReferenceMon(4,20,{boxId:'donor'}),{state,run}=fixture([previewClassicDnaFusion(primary,donor,{random:()=>0}).fused]),first=starterProgress(state.system,1),second=starterProgress(state.system,4);first.candies=9999;first.friendshipPoints=74;second.candies=2;second.friendshipPoints=74;
 addClassicFriendship(run.party[0],3,state.system);assert.equal(first.candies,9999);assert.equal(first.friendshipPoints,74);assert.equal(second.candies,3);assert.equal(second.friendshipPoints,3);
});
