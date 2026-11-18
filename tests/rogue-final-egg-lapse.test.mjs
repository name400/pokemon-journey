import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {lapseClassicEggs} from '../lib/rogue-egg-shop.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('non-final victory lapses eggs once while final wave does not',async()=>{
 const document={coins:0,adventure:{keep:true}},state=ensureClassicState(document),run={id:'egg-boundary',wave:199,eggLapseWaves:[]};state.slots[0]=run;state.slots[1]={keep:true};state.system.eggs=[{id:'ready',productId:'common',remainingWaves:1,paidPrice:0,pokemon:makeReferenceMon(1,5,{boxId:'egg-mon'}),eggMoveIndex:null}];
 lapseClassicEggs(document,run);assert.deepEqual(state.system.pendingHatches.map(e=>e.id),['ready']);assert.equal(state.system.eggs.length,0);assert.deepEqual(run.eggLapseWaves,[199]);const before=structuredClone(document);lapseClassicEggs(document,run);assert.deepEqual(document,before);
 const saved=await decodeGameData(await encodeGameData(document)),savedState=saved.classic,savedRun=savedState.slots[0];savedState.system.eggs.push({id:'final',productId:'common',remainingWaves:1,paidPrice:0,pokemon:makeReferenceMon(4,5,{boxId:'final-mon'}),eggMoveIndex:null});savedRun.wave=200;const finalBefore=structuredClone(saved);lapseClassicEggs(saved,savedRun);assert.deepEqual(saved,finalBefore);assert.equal(savedState.system.eggs[0].remainingWaves,1);assert.deepEqual(savedState.slots[1],{keep:true});assert.deepEqual(saved.adventure,{keep:true});
});
