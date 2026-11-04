import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

function fixture({base='neutralizinggas',passive='levitate',foe='runaway',foeMove='Earthquake',foePassive=null}={}){
 const lead=makeReferenceMon(151,30,{boxId:'gas-owner',ability:base,moves:['Splash']});lead.roguePassiveAbility=passive;
 const reserve=makeReferenceMon(151,30,{boxId:'reserve',ability:'runaway',moves:['Splash']});
 const run={id:'gas-components',wave:22,biome:1,rng:42,screen:'battle',party:[lead,reserve],modifiers:[],tools:{},balls:{},encounter:{kind:'wild'}};
 const enemy=makeReferenceMon(151,20,{boxId:'foe',ability:foe,moves:[foeMove]});if(foePassive)enemy.roguePassiveAbility=foePassive;
 run.combat=createClassicCombat(run,[enemy]);run.party=run.combat.teams[0];return run;
}
test('source Gas owner keeps its other ability: passive Levitate actually blocks Ground damage',()=>{
 const run=fixture(),before=run.party[0].hp,b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.p1.active[0].hasAbility('levitate'),true);
 run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[0][0].hp,before);
});
test('passive Gas suppresses opponents while preserving its owner’s ordinary ability',()=>{
 const run=fixture({base:'hugepower',passive:'neutralizinggas',foe:'levitate',foeMove:'Splash'}),b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.p1.active[0].hasAbility('hugepower'),true);
 assert.equal(b.p2.active[0].hasAbility('levitate'),false);
 assert.equal(b.p1.active[0].hasAbility('neutralizinggas'),true);
 assert.ok(run.combat.log.some(line=>line.includes('화학변화가스')));
});
test('passive Gas leaves with its owner and stays absent across a real switch and JSON reload',()=>{
 let run=fixture({base:'runaway',passive:'neutralizinggas',foe:'levitate',foeMove:'Splash'});
 run.combat=playClassicCombat(run,{type:'switch',slot:2});run.party=run.combat.teams[0];run=JSON.parse(JSON.stringify(run));
 const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].set.trainerToken,'reserve');assert.equal(b.p2.active[0].hasAbility('levitate'),true);
});
test('two Gas sources suppress their owners’ other components; the last owner regains its exception',()=>{
 let run=fixture({base:'levitate',passive:'neutralizinggas',foe:'neutralizinggas',foeMove:'Splash',foePassive:'hugepower'}),b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.p1.active[0].hasAbility('levitate'),false);assert.equal(b.p1.active[0].hasAbility('neutralizinggas'),true);assert.equal(b.p2.active[0].hasAbility('neutralizinggas'),true);
 assert.equal(b.p2.active[0].hasAbility('hugepower'),false);
 run.combat=playClassicCombat(run,{type:'switch',slot:2});run.party=run.combat.teams[0];run=JSON.parse(JSON.stringify(run));
 b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p2.active[0].hasAbility('neutralizinggas'),true);assert.equal(b.p1.active[0].hasAbility('runaway'),false);
 assert.equal(b.p2.active[0].hasAbility('hugepower'),true);
});
test('leaving passive Gas reactivates the opponent’s suppressed entry ability on the remaining ally',()=>{
 const gas=makeReferenceMon(151,30,{boxId:'gas',ability:'runaway',moves:['Splash']});gas.roguePassiveAbility='neutralizinggas';
 const run={id:'gas-leave',wave:22,biome:1,rng:42,party:[gas,makeReferenceMon(151,30,{boxId:'ally',ability:'runaway',moves:['Splash']}),makeReferenceMon(151,30,{boxId:'reserve',ability:'runaway',moves:['Splash']})],modifiers:[],tools:{},balls:{},encounter:{kind:'wild'}};
 run.combat=createClassicCombat(run,[makeReferenceMon(151,20,{boxId:'intimidate',ability:'intimidate',moves:['Splash']}),makeReferenceMon(151,20,{boxId:'other',ability:'runaway',moves:['Splash']})],{doubles:true});run.party=run.combat.teams[0];
 let b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[1].boosts.atk,0);
 run.combat=playClassicCombat(run,{type:'turn',actions:[{actor:0,type:'switch',slot:3},{actor:1,type:'move',move:'splash'}]});run.party=run.combat.teams[0];
 b=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.equal(b.p1.active[1].boosts.atk,-1);
});
function doubleGasFixture(enemyMove){
 const gas=makeReferenceMon(151,5,{boxId:'gas',ability:'runaway',moves:['Splash'],hp:1});gas.roguePassiveAbility='neutralizinggas';
 const run={id:'gas-interruption',wave:22,biome:1,rng:42,party:[gas,makeReferenceMon(151,30,{boxId:'ally',ability:'runaway',moves:['Splash']})],modifiers:[],tools:{},balls:{},encounter:{kind:'wild'}};
 run.combat=createClassicCombat(run,[makeReferenceMon(151,100,{boxId:'attacker',ability:'runaway',moves:[enemyMove]}),makeReferenceMon(151,20,{boxId:'intimidate',ability:'intimidate',moves:['Splash']})],{doubles:true});run.party=run.combat.teams[0];return run;
}
test('fainting passive Gas reactivates a suppressed entry ability without a switch-out event',()=>{
 const run=doubleGasFixture('Night Shade'),b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.p1.active[1].boosts.atk,0);
 b.makeChoices('move splash, move splash','move nightshade 1, move splash');
 assert.equal(b.p1.active[0].hp,0);assert.equal(b.p1.active[1].boosts.atk,-1);assert.equal(b.p2.active[1].hasAbility('intimidate'),true);
});
test('Gastro Acid ending passive Gas reactivates the remaining field’s suppressed ability',()=>{
 const run=doubleGasFixture('Gastro Acid'),b=restoreClassicNativeBattle(run.combat,run);
 assert.equal(b.p1.active[1].boosts.atk,0);
 b.makeChoices('move splash, move splash','move gastroacid 1, move splash');
 assert.ok(b.p1.active[0].volatiles.gastroacid);assert.equal(b.p1.active[0].hasAbility('neutralizinggas'),false);assert.equal(b.p1.active[1].boosts.atk,-1);
});
