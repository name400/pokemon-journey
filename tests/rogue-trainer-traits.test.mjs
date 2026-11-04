import assert from 'node:assert/strict';
import {classicTrainerAbility,classicTrainerIvs,classicTrainerFriendship} from '../lib/rogue-trainer-traits.mjs';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

const abilities=[{slot:'primary',key:'first'},{slot:'secondary',key:'second'},{slot:'hidden',key:'hidden'}];
const rolls=(...values)=>()=>{assert.ok(values.length,'unexpected random draw');return values.shift();};
assert.equal(classicTrainerAbility(abilities,rolls(.75,0)).key,'hidden');
assert.equal(classicTrainerAbility(abilities,rolls(.75,1/256)).key,'second');
assert.equal(classicTrainerAbility([abilities[0]],rolls()).key,'first');
assert.deepEqual(Object.values(classicTrainerIvs(199,rolls(0,.999,0,.999,0,.999))),[19,31,19,31,19,31]);
assert.equal(classicTrainerFriendship(1),50);assert.equal(classicTrainerFriendship(100),176);assert.equal(classicTrainerFriendship(145),255);
// A known roll produces a hidden ability in the real trainer path. Player
// ability charms affect wild encounters only and do not change this roll.
for(const modifiers of [[],[{id:'abilitycharm',count:4}]]){
 const run={id:'hidden',wave:100,biome:0,rng:1773,party:[makeReferenceMon(151,100,{boxId:'player'})],modifiers,tools:{},seed:'fixture',trainerTraitsRule:'source-v1'};
 const encounter=classicTrainerEncounter(run,5,{kind:'trainer'});run.encounter=encounter;
 const mon=encounter.team.find(p=>p.rogueAbilitySlot==='hidden');assert.equal(mon?.ability,'skilllink');
 const battle=restoreClassicNativeBattle(createClassicCombat(run,encounter.team,{trainer:true,doubles:encounter.doubles}),run);
 assert.equal(battle.p2.pokemon.find(p=>p.set.trainerToken===mon.boxId).getAbility().id,'skilllink');
}
for(const wave of [20,100,145,199]){
 const run={id:'traits',wave,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'player'})],modifiers:[{id:'abilitycharm',count:4}],tools:{},seed:'fixture',trainerTraitsRule:'source-v1'};
 const encounter=classicTrainerEncounter(run,355,{kind:'champion'});run.encounter=encounter;
 for(const mon of encounter.team){assert.ok(Object.values(mon.ivs).every(iv=>iv>=Math.floor(wave/10)&&iv<=31));assert.equal(mon.friendship,classicTrainerFriendship(wave));}
 assert.equal(encounter.team.find(mon=>mon.rogueSourceId===468)?.ability,'serenegrace');
 const combat=createClassicCombat(run,encounter.team,{trainer:true});
 const restored=restoreClassicNativeBattle(JSON.parse(JSON.stringify(combat)),run);
 for(const [i,mon] of encounter.team.entries()){const native=restored.p2.pokemon[i];assert.equal(native.set.happiness,mon.friendship);assert.equal(native.happiness,mon.friendship);assert.equal(native.getAbility().id,mon.ability);assert.equal(native.getStat('atk',false,true),mon.stats.atk);}
}
// Legacy runs retain the prior no-hidden-ability generation and source-species friendship.
for(const rng of [1,42,123]){
 const run={id:'legacy',wave:199,biome:0,rng,party:[makeReferenceMon(151,100,{boxId:'player'})],modifiers:[],tools:{},seed:'fixture'};
 const encounter=classicTrainerEncounter(run,5,{kind:'trainer'});
 for(const mon of encounter.team){assert.notEqual(mon.rogueAbilitySlot,'hidden');assert.equal(mon.rogueTrainerTraits,undefined);}
}
console.log('Trainer traits, legacy compatibility, fixed ability and serialized native battle verified.');
