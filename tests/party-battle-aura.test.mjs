import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';

test('AI damage estimates do not corrupt cached aura moves or saved battles',()=>{
 const player={...makeMon(150,100),boxId:'player',moves:['방어'],pp:{}};
 for(const {id,ability,move,key,item} of [{id:10061,ability:'fairyaura',move:'파멸의빛',key:'lightofruin',item:'floettite'},{id:717,ability:'darkaura',move:'악의파동',key:'darkpulse',item:''}]){
  const foe={...makeMon(id,72),boxId:`foe-${id}`,ability,moves:[move],item,pp:{}};
  const before={...Dex.moves.get(key)};let combat=createCombat([player],[foe]);const initialPP=combat.teams[1][0].pp[key];
  combat=playCpu(JSON.parse(JSON.stringify(combat)),{type:'move',move:'방어'});
  assert.ok(combat.teams[1][0].pp[key]<initialPP,`${key} must actually be used`);assert.equal(Dex.moves.get(key).auraBooster,undefined,`${key} must not retain a battle reference`);
  assert.equal(Dex.moves.get(key).basePower,before.basePower);
  assert.doesNotThrow(()=>JSON.stringify(combat));if(!combat.ended){const reloaded=JSON.parse(JSON.stringify(combat));assert.doesNotThrow(()=>playCpu(reloaded,{type:'move',move:'방어'}));}assert.equal(combat.teams[0][0].boxId,'player');assert.equal(combat.teams[1][0].boxId,`foe-${id}`);
 }
});

test('classic AI aura damage estimates do not poison shared simulator move data',async()=>{
 const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');const {createClassicCombat,playClassicCombat}=await import('../lib/rogue-battle-engine.mjs');
 const run={id:'aura-ai',wave:200,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'aura-ai'};
 const foe=makeReferenceMon(717,72,{boxId:'enemy',ability:'darkaura',moves:['Dark Pulse']});run.combat=createClassicCombat(run,[foe],{trainer:true});
 run.combat=playClassicCombat(run,{type:'move',move:'protect'});assert.equal(Dex.moves.get('darkpulse').auraBooster,undefined);assert.doesNotThrow(()=>JSON.stringify(run.combat));
});
