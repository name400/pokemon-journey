import test from 'node:test';
import assert from 'node:assert/strict';
import {rogueSpecies,makeReferenceMon} from '../lib/rogue-reference.mjs';
import {applyClassicEggForm} from '../lib/rogue-egg-forms.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {lapseClassicEggs,acknowledgeClassicHatch} from '../lib/rogue-egg-shop.mjs';
import {classicSourceFormAtlas} from '../components/rogue-source-form-images.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('hatched alternate form retains the identity needed by the result image after reload',async()=>{
 const doc={coins:17,adventure:{safe:true}},state=ensureClassicState(doc,{initialStarterId:1}),mon=applyClassicEggForm(makeReferenceMon(669,5,{boxId:'flower',gender:'F',shiny:true,variant:1}),rogueSpecies.get(669),()=>.99);state.slots[1]={id:'other',safe:true};
 assert.equal(mon.rogueFormKey,'white');assert.equal(classicSourceFormAtlas(mon)?.key,'669-white');state.system.eggs=[{id:'flower-egg',productId:'common',paidPrice:0,remainingWaves:1,pokemon:mon}];
 lapseClassicEggs(doc,{wave:5});let result=state.system.pendingHatches[0];assert.equal(result.pokemon.rogueFormKey,mon.rogueFormKey);assert.equal(result.pokemon.gender,mon.gender);assert.deepEqual(classicSourceFormAtlas(result.pokemon),classicSourceFormAtlas(mon));
 const saved=await decodeGameData(await encodeGameData(doc));result=saved.classic.system.pendingHatches[0];assert.equal(classicSourceFormAtlas(result.pokemon)?.key,'669-white');assert.equal(saved.classic.system.hatchHistory[0].pokemon.rogueFormKey,'white');assert.deepEqual(saved.classic.slots[1],{id:'other',safe:true});assert.deepEqual(saved.adventure,{safe:true});const coins=saved.coins;acknowledgeClassicHatch(saved,'flower-egg');assert.equal(saved.coins,coins);assert.equal(saved.classic.system.pendingHatches.length,0);
});
