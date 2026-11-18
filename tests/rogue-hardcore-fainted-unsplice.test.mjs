import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(hardcore=true){
 const p=previewClassicDnaFusion(makeReferenceMon(1,30,{boxId:'fused',moves:['Tackle']}),makeReferenceMon(4,30,{boxId:'donor',moves:['Tackle']}),{random:()=>0}).fused;p.hp=0;
 const data=fixture([p,makeReferenceMon(7,20,{boxId:'alive',moves:['Tackle']})]);data.run.challenges=hardcore?[{id:9,value:1}]:[];return data;
}
test('hardcore disallows unsplicing a fainted fusion and preserves both identities',async()=>{
 const {doc,run}=setup();const before=structuredClone(run.party);assert.equal(classicGameView(doc).run.party[0].canUnsplice,false);
 assert.throws(()=>applyClassicAction(doc,{action:'unsplice',boxId:'fused',confirm:true}),/영구 기절/);assert.deepEqual(run.party,before);
 const saved=await decodeGameData(await encodeGameData(doc));assert.deepEqual(saved.classic.slots[0].party,before);assert.deepEqual(saved.adventure,{safe:true});assert.equal(saved.classic.slots[1].id,'other');
});
for(const hardcore of [false,true])test(`unsplice remains available for ${hardcore?'living hardcore':'fainted ordinary'} members`,()=>{
 const {doc,run}=setup(hardcore);if(hardcore)run.party[0].hp=run.party[0].maxHp;assert.equal(classicGameView(doc).run.party[0].canUnsplice,true);
 applyClassicAction(doc,{action:'unsplice',boxId:'fused',confirm:true});assert.equal(run.party[0].fusionSpecies,undefined);
});
