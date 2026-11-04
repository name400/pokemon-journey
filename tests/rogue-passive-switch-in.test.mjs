import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

function fixture(passive,enemyAbility='runaway'){
 const hero=makeReferenceMon(151,20,{boxId:'switchin-owner',ability:'levitate',moves:['Splash']});hero.roguePassiveAbility=passive;
 const run={id:'passive-switchin',wave:22,biome:1,rng:2,party:[hero],modifiers:[],tools:{},balls:{},encounter:{kind:'wild'}};
 run.combat=createClassicCombat(run,[makeReferenceMon(500,20,{boxId:'enemy',ability:enemyAbility,moves:['Flamethrower']})]);run.party=run.combat.teams[0];return run;
}
test('passive Imposter runs its real entry callback and preserves the copied state after reload',()=>{
 let run=fixture('imposter'),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],enemy=b.p2.active[0];
 assert.equal(hero.transformed,true);assert.equal(hero.species.id,enemy.species.id);assert.equal(hero.getAbility().id,enemy.getAbility().id);assert.equal(hero.moveSlots[0].id,'flamethrower');
 run=JSON.parse(JSON.stringify(run));b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].transformed,true);assert.equal(b.p1.active[0].moveSlots[0].id,'flamethrower');
});
test('entry Gas suppresses passive Imposter instead of allowing an illegal transformation',()=>{
 const run=fixture('imposter','neutralizinggas'),b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.p1.active[0].transformed,false);assert.equal(b.p1.active[0].species.id,'mew');assert.equal(b.p1.active[0].moveSlots[0].id,'splash');
});
