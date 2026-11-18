import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicEvolutionOptions,classicEvolutionItemCandidates} from '../lib/rogue-evolution.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';

function setup(hardcore=true){
 const dead=makeReferenceMon(25,30,{boxId:'dead',moves:['Tackle']});dead.hp=0;
 const data=fixture([dead,makeReferenceMon(7,20,{boxId:'alive',moves:['Tackle']})]);
 data.run.challenges=hardcore?[{id:9,value:1}]:[];data.run.evolutionItems={thunderstone:1};
 return data;
}
test('hardcore blocks manual evolution of a fainted member without consuming an item',async()=>{
 const {doc,run,state}=setup();const option=classicEvolutionOptions(run.party[0],run,state.system).find(e=>e.item==='thunderstone'&&e.ready);
 assert.ok(option);const view=classicGameView(doc).run.party.find(p=>p.boxId==='dead').evolutions.find(e=>e.key===option.key);
 assert.equal(view.ready,false);assert.ok(view.conditions.some(c=>!c.met&&c.label==='영구 기절 상태'));
 const party=structuredClone(run.party),items=structuredClone(run.evolutionItems);
 assert.throws(()=>applyClassicAction(doc,{action:'evolve',boxId:'dead',evolutionKey:option.key}),/영구 기절/);
 assert.deepEqual(run.party,party);assert.deepEqual(run.evolutionItems,items);
 const restored=ensureClassicState(await decodeGameData(await encodeGameData(doc))).slots[0];
 assert.deepEqual(restored.party,party);assert.deepEqual(restored.evolutionItems,items);
});
test('evolution item reward candidates exclude permanently fainted targets only',()=>{
 const {run,state}=setup();run.evolutionItems={};
 assert.equal(classicEvolutionItemCandidates(run,state.system).some(c=>c.boxId==='dead'&&c.item==='thunderstone'),false);
 run.challenges=[];assert.equal(classicEvolutionItemCandidates(run,state.system).some(c=>c.boxId==='dead'&&c.item==='thunderstone'),true);
});
test('ordinary mode still allows evolving a fainted member',()=>{
 const {doc,run,state}=setup(false);const option=classicEvolutionOptions(run.party[0],run,state.system).find(e=>e.item==='thunderstone'&&e.ready);
 assert.equal(classicGameView(doc).run.party[0].evolutions.find(e=>e.key===option.key).ready,true);
 applyClassicAction(doc,{action:'evolve',boxId:'dead',evolutionKey:option.key});
 assert.equal(run.party[0].rogueSourceId,26);assert.equal(run.party[0].hp,0);assert.equal(run.evolutionItems.thunderstone,0);
});
test('hardcore still allows a living member to evolve',()=>{
 const {doc,run,state}=setup();run.party[0].hp=run.party[0].maxHp;
 const option=classicEvolutionOptions(run.party[0],run,state.system).find(e=>e.item==='thunderstone'&&e.ready);
 applyClassicAction(doc,{action:'evolve',boxId:'dead',evolutionKey:option.key});assert.equal(run.party[0].rogueSourceId,26);
});
