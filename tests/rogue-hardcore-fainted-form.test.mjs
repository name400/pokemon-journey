import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(hardcore=true){const p=makeReferenceMon(492,50,{boxId:'shaymin',moves:['Splash']});p.hp=0;const data=fixture([p,makeReferenceMon(7,20,{boxId:'alive',moves:['Tackle']})]);data.run.challenges=hardcore?[{id:9,value:1}]:[];data.run.formItems={shaymin:['gracidea']};return data;}
test('hardcore prevents manual form changes on fainted members without modifying saved data',async()=>{
 const {doc,run}=setup();const option=classicGameView(doc).run.party[0].forms.find(f=>f.key==='gracidea');assert.equal(option.blockedReason,'영구 기절 상태');
 const before=structuredClone(run.party),items=structuredClone(run.formItems);assert.throws(()=>applyClassicAction(doc,{action:'form',boxId:'shaymin',item:'gracidea'}),/영구 기절/);
 assert.deepEqual(run.party,before);assert.deepEqual(run.formItems,items);const saved=await decodeGameData(await encodeGameData(doc));assert.deepEqual(saved.classic.slots[0].party,before);assert.deepEqual(saved.adventure,{safe:true});
});
for(const hardcore of [false,true])test(`manual form changes remain available for ${hardcore?'living hardcore':'fainted ordinary'} members`,()=>{
 const {doc,run}=setup(hardcore);if(hardcore)run.party[0].hp=run.party[0].maxHp;
 assert.equal(classicGameView(doc).run.party[0].forms.find(f=>f.key==='gracidea').blockedReason,undefined);
 applyClassicAction(doc,{action:'form',boxId:'shaymin',item:'gracidea'});assert.equal(run.party[0].rogueFormKey,'sky');
});
