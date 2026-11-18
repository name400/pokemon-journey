import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

function setup(){
 const result=fixture([makeReferenceMon(133,20,{boxId:'eevee',moves:['Tackle']})]);
 result.run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='evolutionitem'),rewardId:'stone',boxId:'eevee',evolutionItem:'firestone',name:'불꽃의돌'}];
 return result;
}

test('earned evolution item can be reviewed and used after save recovery',async()=>{
 let {doc}=setup();applyClassicAction(doc,{action:'reward',rewardId:'stone',boxId:'eevee'});
 doc=await decodeGameData(await encodeGameData(doc));const run=ensureClassicState(doc).slots[0],view=classicGameView(doc);
 assert.equal(run.screen,'advance');assert.equal(run.evolutionItemReview,true);assert.equal(run.evolutionItems.firestone,1);
 const option=view.run.party[0].evolutions.find(e=>e.item==='firestone');assert.equal(option.ready,true);
 assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:'stone',boxId:'eevee'}));
 applyClassicAction(doc,{action:'evolve',boxId:'eevee',evolutionKey:option.key});
 assert.equal(run.party[0].rogueSourceId,136);assert.equal(run.evolutionItems.firestone,0);assert.equal(run.evolutionItemReview,true);
 const restored=await decodeGameData(await encodeGameData(doc));assert.equal(ensureClassicState(restored).slots[0].party[0].rogueSourceId,136);assert.deepEqual(restored.adventure,{safe:true});assert.equal(ensureClassicState(restored).slots[1].id,'other');
});

test('review may be declined and next battle starts without consuming the item',()=>{
 const {doc,run}=setup();applyClassicAction(doc,{action:'reward',rewardId:'stone',boxId:'eevee'});applyClassicAction(doc,{action:'next'});
 assert.equal(run.evolutionItemReview,undefined);assert.equal(run.evolutionItems.firestone,1);assert.equal(run.party[0].rogueSourceId,133);assert.equal(run.screen,'battle');
});

for(const slot of [null,0])test(`evolution move ${slot===null?'declined':'learned'} returns to review after recovery`,async()=>{
 let {doc,run}=setup();run.party[0].moves=['Tackle','Growl','Quick Attack','Bite'];applyClassicAction(doc,{action:'reward',rewardId:'stone',boxId:'eevee'});
 const option=classicGameView(doc).run.party[0].evolutions.find(e=>e.item==='firestone');applyClassicAction(doc,{action:'evolve',boxId:'eevee',evolutionKey:option.key});assert.equal(run.screen,'learn');
 doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];const pending=run.pendingMoves[0];applyClassicAction(doc,{action:'learn',boxId:pending.boxId,move:pending.move,slot});
 assert.equal(run.screen,'advance');assert.equal(run.wave,21);assert.equal(run.evolutionItemReview,true);assert.equal(run.party[0].moves.includes(pending.move),slot!==null);
 doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];assert.equal(run.screen,'advance');assert.equal(run.evolutionItemReview,true);applyClassicAction(doc,{action:'next'});
 assert.equal(run.screen,'battle');assert.equal(run.wave,22);assert.equal(run.evolutionItemReview,undefined);assert.equal(run.evolutionItems.firestone,0);assert.deepEqual(doc.adventure,{safe:true});
});

test('ordinary rewards still proceed directly to the next battle',()=>{
 const {doc,run}=setup();run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='pokeball'),rewardId:'balls'}];
 applyClassicAction(doc,{action:'reward',rewardId:'balls'});assert.equal(run.evolutionItemReview,undefined);assert.equal(run.screen,'battle');assert.ok(run.balls.pokeball>0);
});

test('review after a real finished battle preserves the evolved combat state',()=>{
 const {doc,run}=setup(),foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;run.party[0].moves=['Seismic Toss'];
 run.combat=createClassicCombat(run,[foe]);run.combat=playClassicCombat(run,{type:'move',move:'seismictoss'});assert.equal(run.combat.ended,true);run.party=run.combat.teams[0];
 applyClassicAction(doc,{action:'reward',rewardId:'stone',boxId:'eevee'});const option=classicGameView(doc).run.party[0].evolutions.find(e=>e.item==='firestone');applyClassicAction(doc,{action:'evolve',boxId:'eevee',evolutionKey:option.key});
 assert.equal(run.combat.teams[0][0].rogueSourceId,136);assert.equal(run.combat.ended,true);applyClassicAction(doc,{action:'next'});assert.equal(run.screen,'battle');assert.equal(run.party[0].rogueSourceId,136);
});

test('current friendship, time and weather conditions are reflected after recovery',async()=>{
 const {doc,run}=fixture([makeReferenceMon(172,10,{boxId:'pichu',friendship:89}),makeReferenceMon(133,20,{boxId:'eevee',friendship:160,moves:['Tackle']}),makeReferenceMon(705,50,{boxId:'sliggoo'})]);
 run.weather='sunnyday';run.wave=10;const option=(box,id)=>classicGameView(doc).run.party.find(p=>p.boxId===box).evolutions.find(e=>e.sourceId===id);
 assert.equal(option('pichu',25).ready,false);assert.equal(option('eevee',196).ready,true);assert.equal(option('sliggoo',706).ready,false);
 run.party[0].friendship=90;run.wave=25;run.weather='raindance';assert.equal(option('pichu',25).ready,true);assert.equal(option('eevee',196).ready,false);assert.equal(option('sliggoo',706).ready,true);
 const restored=await decodeGameData(await encodeGameData(doc)),view=classicGameView(restored);assert.equal(view.run.party.find(p=>p.boxId==='pichu').evolutions.find(e=>e.sourceId===25).ready,true);assert.equal(view.run.party.find(p=>p.boxId==='eevee').evolutions.find(e=>e.sourceId===196).ready,false);assert.equal(view.run.party.find(p=>p.boxId==='sliggoo').evolutions.find(e=>e.sourceId===706).ready,true);assert.deepEqual(restored.adventure,{safe:true});
});
