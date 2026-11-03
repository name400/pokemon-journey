import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
function battle(seed,{modern=true,knockout=false}={}){
 const player=makeReferenceMon(151,80,{boxId:'p',moves:['Protect']}),enemy=makeReferenceMon(151,80,{boxId:'f',moves:knockout?['Recover','Tackle']:['Tackle','Pound']});
 if(knockout){player.hp=1;enemy.hp=Math.floor(enemy.maxHp/4);}
 const run={id:'ai',wave:100,biome:0,rng:seed,party:[player],modifiers:[],tools:{},seed:'fixture',...(modern?{trainerAiRule:'source-v1'}:{})};run.encounter={kind:'trainer'};run.combat=createClassicCombat(run,[enemy],{trainer:true});return run;
}
const choices=new Set();for(let seed=1;seed<=12;seed++){const run=battle(seed);run.combat=playClassicCombat(run,{type:'move',move:'protect'});choices.add(restoreClassicNativeBattle(run.combat,run).p2.active[0].lastMove.id);}
assert.deepEqual([...choices].sort(),['pound','tackle']);
for(let seed=1;seed<=6;seed++){const run=battle(seed,{knockout:true});run.combat=playClassicCombat(run,{type:'move',move:'protect'});assert.equal(restoreClassicNativeBattle(run.combat,run).p2.active[0].lastMove.id,'tackle');}
for(let seed=1;seed<=6;seed++){const run=battle(seed,{modern:false});assert.equal(run.combat.trainerAiRule,undefined);const copy=JSON.parse(JSON.stringify(run));run.combat=playClassicCombat(run,{type:'move',move:'protect'});copy.combat=playClassicCombat(copy,{type:'move',move:'protect'});assert.equal(restoreClassicNativeBattle(run.combat,run).p2.active[0].lastMove.id,restoreClassicNativeBattle(copy.combat,copy).p2.active[0].lastMove.id);}
const run=battle(2),copy=JSON.parse(JSON.stringify(run));run.combat=playClassicCombat(run,{type:'move',move:'protect'});copy.combat=playClassicCombat(copy,{type:'move',move:'protect'});assert.equal(restoreClassicNativeBattle(run.combat,run).p2.active[0].lastMove.id,restoreClassicNativeBattle(copy.combat,copy).p2.active[0].lastMove.id);assert.deepEqual(run.combat.snapshot.prng,copy.combat.snapshot.prng);
const double=battle(42);double.party.push(makeReferenceMon(150,80,{boxId:'partner',moves:['Protect']}));double.combat=createClassicCombat(double,[makeReferenceMon(151,80,{boxId:'f1',moves:['Tackle','Pound']}),makeReferenceMon(151,80,{boxId:'f2',moves:['Tackle','Pound']})],{trainer:true,doubles:true});double.combat=playClassicCombat(double,{type:'turn',actions:[{actor:0,type:'move',move:'protect'},{actor:1,type:'move',move:'protect'}]});assert.equal(restoreClassicNativeBattle(double.combat,double).p2.active.filter(p=>p.lastMove).length,2);
// Penny's explicitly fixed friendship survives generation and reaches the
// native friendship-dependent move calculation in new but not old runs.
for(const [id,wave] of [[118,115],[119,165]]){
 const base={id:'friendship',wave,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'p'})],modifiers:[],tools:{},seed:'fixture',trainerTraitsRule:'source-v1'};
 const old=classicTrainerEncounter(structuredClone(base),id,{kind:'evil'}),run={...base,trainerFixedFriendshipRule:'source-v1'},encounter=classicTrainerEncounter(run,id,{kind:'evil'}),eevee=encounter.team[5];assert.equal(eevee.friendship,255);if(wave===115)assert.equal(old.team[5].friendship,202);run.encounter=encounter;const native=restoreClassicNativeBattle(createClassicCombat(run,[eevee],{trainer:true}),run);assert.equal(native.p2.active[0].happiness,255);assert.equal(native.dex.moves.get('veeveevolley').basePowerCallback.call(native,native.p2.active[0]),102);
}
console.log('Trainer KO priority, score-ratio variation, seeded restore, legacy policy and fixed Eevee friendship passed.');
