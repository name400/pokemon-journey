import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicTransferInventory,transferClassicModifier} from '../lib/rogue-classic-rewards.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const make=()=>({screen:'reward',party:[makeReferenceMon(1,20,{boxId:'one'}),makeReferenceMon(7,20,{boxId:'two'})],modifiers:[{id:'shellbell',boxId:'one',count:1},{id:'shellbell',boxId:'one',typeBoost:null,count:2},{id:'shellbell',boxId:'two',typeBoost:null,count:1}]});
const transfer=(run,quantity)=>transferClassicModifier(run,{fromBoxId:'one',toBoxId:'two',id:'shellbell',quantity});
test('legacy split stacks display as one and transfer together across save reloads',async()=>{
 let run=make();assert.deepEqual(classicTransferInventory(run,run.party[0]).map(x=>[x.id,x.count]),[['shellbell',3]]);transfer(run,3);
 assert.equal(run.modifiers.filter(m=>m.boxId==='one').length,0);assert.equal(run.modifiers.find(m=>m.boxId==='two').count,4);
 const doc=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(doc.other,{safe:true});assert.equal(doc.run.modifiers.find(m=>m.boxId==='two').count,4);
});
test('cap failure preserves every source and destination row',()=>{const run=make();run.modifiers[2].count=2;const before=structuredClone(run);assert.throws(()=>transfer(run,3),/한도/);assert.deepEqual(run,before);});
test('extra metadata is not mixed with other stacks',()=>{const run=make();run.modifiers[1].customEffect='distinct';assert.equal(classicTransferInventory(run,run.party[0]).find(x=>x.id==='shellbell').count,1);const before=structuredClone(run);assert.throws(()=>transfer(run,2));assert.deepEqual(run,before);transfer(run,1);assert.equal(run.modifiers.find(m=>m.customEffect==='distinct').count,2);});

test('destination metadata remains attached to its original item',()=>{
 const run=make();run.modifiers[2].customEffect='distinct';transfer(run,2);
 const rows=run.modifiers.filter(m=>m.boxId==='two');
 assert.equal(rows.length,2);assert.equal(rows.find(m=>m.customEffect==='distinct').count,1);assert.equal(rows.find(m=>!m.customEffect).count,2);
});

test('actual party view and transfer action expose and move the full saved stack',async()=>{
 const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs');
 const {classicGameView,applyClassicAction}=await import('../lib/rogue-classic-game.mjs');
 const doc={coins:123,collection:[],adventure:{safe:true}},state=ensureClassicState(doc),run=make();
 Object.assign(run,{id:'split',wave:12,biome:1,rng:9,tools:{},encounter:{kind:'wild'},rewards:[],balls:{},log:[]});state.slots[0]=run;state.slots[1]={untouched:true};
 assert.equal(classicGameView(doc).run.party[0].transferItems.find(item=>item.id==='shellbell').count,3);
 applyClassicAction(doc,{action:'transferModifier',fromBoxId:'one',toBoxId:'two',id:'shellbell',kind:'modifier',quantity:3});
 const saved=await decodeGameData(await encodeGameData(doc));assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(saved.classic.slots[1],{untouched:true});
 assert.equal(classicGameView(saved).run.party[1].transferItems.find(item=>item.id==='shellbell').count,4);
});
