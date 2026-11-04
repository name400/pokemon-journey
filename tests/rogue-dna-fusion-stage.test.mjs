import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {learnClassicPendingMove} from '../lib/rogue-classic-growth.mjs';
const mon=(id,boxId,moves=['Splash'])=>makeReferenceMon(id,50,{boxId,moves});
const fixture=()=>({screen:'reward',party:[mon(1,'a',['Tackle','Growl','Vine Whip','Leech Seed']),mon(7,'b',['Water Gun','Tail Whip']),mon(4,'c')],modifiers:[{id:'quickclaw',boxId:'b',count:2,typeBoost:null}],formItems:{c:['safe']},pendingMoves:[],pendingGrowth:[],tools:{},rng:42});
test('stages held effects and move decisions without changing original or unrelated party',()=>{
 const run=fixture(),before=structuredClone(run),result=stageClassicDnaFusion(run,{primaryBoxId:'a',donorBoxId:'b'}),next=JSON.parse(JSON.stringify(result.run));assert.deepEqual(run,before);assert.deepEqual(next.party.map(m=>m.boxId),['a','c']);assert.deepEqual(next.party[1],before.party[2]);assert.deepEqual(next.formItems,before.formItems);assert.deepEqual(next.modifiers,[{id:'quickclaw',boxId:'a',count:2,typeBoost:null}]);assert.deepEqual(next.pendingMoves.map(m=>m.move),['Water Gun','Tail Whip']);assert.deepEqual(next.party[0].rogueFusion.donor,before.party[1]);learnClassicPendingMove(next,{boxId:'a',move:'Water Gun',slot:0});const saved=JSON.parse(JSON.stringify(next));learnClassicPendingMove(saved,{boxId:'a',move:'Tail Whip',slot:null});assert.deepEqual(saved.party[0].moves,['Water Gun','Growl','Vine Whip','Leech Seed']);assert.equal(saved.pendingMoves.length,0);
});
test('refuses incompatible or unknown held items without changing original run',()=>{
 for(const mutate of [r=>{r.party[0].item='leftovers';r.party[1].item='oranberry';},r=>{r.formItems.b=['form'];},r=>{r.modifiers[0].id='unknown';},r=>{r.modifiers.push({id:'quickclaw',boxId:'a',count:2,typeBoost:null});},r=>{r.challenges=['type'];}]){const r=fixture();mutate(r);const before=structuredClone(r);assert.throws(()=>stageClassicDnaFusion(r,{primaryBoxId:'a',donorBoxId:'b'}));assert.deepEqual(r,before);}
});
test('transfers a supported native item when the first slot is empty',()=>{const r=fixture();r.party[1].item='leftovers';const result=stageClassicDnaFusion(r,{primaryBoxId:'a',donorBoxId:'b'});assert.equal(result.run.party[0].item,'leftovers');assert.equal(r.party[1].item,'leftovers');});
test('staged learning survives actual document codec without changing other saves',async()=>{
 const {encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');const original=fixture(),other={id:'other-slot',party:[{safe:true}]},doc={classic:{slots:[original,other]},adventure:{keep:true}};const stage=stageClassicDnaFusion(doc.classic.slots[0],{primaryBoxId:'a',donorBoxId:'b'});doc.classic.slots[0]=stage.run;const loaded=await decodeGameData(await encodeGameData(doc));assert.deepEqual(loaded.classic.slots[1],other);assert.deepEqual(loaded.adventure,{keep:true});assert.deepEqual(loaded.classic.slots[0].pendingMoves.map(m=>m.move),['Water Gun','Tail Whip']);assert.deepEqual(loaded.classic.slots[0].party[0].rogueFusion.donor,original.party[1]);
});
test('does not collapse stat-specific or opaque modifier metadata',()=>{const r=fixture();r.modifiers[0].stat='atk';const before=structuredClone(r);assert.throws(()=>stageClassicDnaFusion(r,{primaryBoxId:'a',donorBoxId:'b'}));assert.deepEqual(r,before);});
