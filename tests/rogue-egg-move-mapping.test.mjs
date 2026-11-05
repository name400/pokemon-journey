import test from 'node:test';import assert from 'node:assert/strict';
import {rogueSpecies,rogueReferenceData,sourceMove} from '../lib/rogue-reference.mjs';
import {starterLegalMoves} from '../lib/rogue-starter-system.mjs';
import {Dex} from '@pkmn/sim';
test('all starter egg move slots resolve to their own source move and unlocked slot',()=>{
 let count=0;for(const s of rogueSpecies.values()){if(!s.isStarter||!s.eggMoves?.length)continue;count++;for(const [index,id] of s.eggMoves.entries()){const name=sourceMove(id);assert.ok(name,`${s.enumName} slot ${index}`);const system={starterData:{[s.sourceId]:{eggMask:1<<index}}};assert.ok(starterLegalMoves(system,s.sourceId).includes(name),`${s.enumName} slot ${index}`);}}
 assert.equal(count,571);const s=rogueSpecies.get(227);assert.equal(rogueReferenceData.enums.MoveId.BEHEMOTH_BLADE,s.eggMoves[1]);assert.equal(Dex.moves.get('behemothblade').num,s.eggMoves[1]);assert.equal(sourceMove(s.eggMoves[1]),'거수참');
});
test('Skarmory hatch unlocks the documented second slot without altering other saved data',async()=>{
 const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');const {hatchClassicEgg,eggShopView}=await import('../lib/rogue-egg-shop.mjs');const {encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');
 const doc={coins:0,collection:[],adventure:{sentinel:'preserved'}},state=ensureClassicState(doc,{initialStarterId:1});state.slots[1]={sentinel:'slot'};eggShopView(doc);state.system.eggs=[];state.system.eggs.push({id:'egg-test',productId:'rare',remainingWaves:0,pokemon:makeReferenceMon(227,5,{boxId:'skarmory'}),eggMoveIndex:1});
 const result=hatchClassicEgg(doc,'egg-test');assert.equal(result.eggMove,'거수참');assert.equal(state.system.starterData[227].eggMask&2,2);const restored=await decodeGameData(await encodeGameData(doc));assert.deepEqual(restored.adventure,{sentinel:'preserved'});assert.deepEqual(ensureClassicState(restored).slots[1],{sentinel:'slot'});assert.equal(ensureClassicState(restored).system.starterData[227].eggMask&2,2);
});
