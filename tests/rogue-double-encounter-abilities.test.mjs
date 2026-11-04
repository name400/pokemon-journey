import test from 'node:test';
import assert from 'node:assert/strict';
import {classicDoubleAbilityBoosts,classicEncounter,classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

function fixture(){
 const party=[{boxId:'one',hp:10,ability:'illuminate'},{boxId:'two',hp:10,ability:'pressure'},{boxId:'bench',hp:10,ability:'arenatrap'}];
 return {party,combat:{activeBySide:[[0,1]],snapshot:{sides:[{pokemon:party.map((p,i)=>({set:{trainerToken:p.boxId},ability:p.ability,isActive:i<2,item:'',volatiles:{}}))}]}}};
}
test('double encounter boost uses current native ability, not its original registration',()=>{
 const run=fixture(),native=run.combat.snapshot.sides[0].pokemon;
 assert.equal(classicDoubleAbilityBoosts(run),1);
 native[0].ability='pressure';native[1].ability='noguard';
 assert.equal(classicDoubleAbilityBoosts(run),1);
 native[1].ability='pressure';assert.equal(classicDoubleAbilityBoosts(run),0);
 run.party[1].roguePassiveAbility='illuminate';assert.equal(classicDoubleAbilityBoosts(run),1);
 native[1].ability='illuminate';assert.equal(classicDoubleAbilityBoosts(run),1);
 run.party[0].hp=0;assert.equal(classicDoubleAbilityBoosts(run),1);
});
test('passive Neutralizing Gas suppresses other field owners but preserves its owner’s boost',()=>{
 const run=fixture(),native=run.combat.snapshot.sides[0].pokemon;
 run.party[1].roguePassiveAbility='neutralizinggas';
 assert.equal(classicDoubleAbilityBoosts(run),0);
 native[0].item='abilityshield';assert.equal(classicDoubleAbilityBoosts(run),1);
 native[0].item='';native[1].ability='arenatrap';assert.equal(classicDoubleAbilityBoosts(run),1);
 native[1].volatiles.gastroacid={};assert.equal(classicDoubleAbilityBoosts(run),1);
 native[0].volatiles.gastroacid={};assert.equal(classicDoubleAbilityBoosts(run),0);
});
test('only living field owners boost encounters; bench gas never suppresses the field',()=>{
 const run=fixture();run.party[2].roguePassiveAbility='neutralizinggas';
 assert.equal(classicDoubleAbilityBoosts(run),1);
 run.party[0].roguePassiveAbility='noguard';assert.equal(classicDoubleAbilityBoosts(run),2);
 run.party[0].hp=0;assert.equal(classicDoubleAbilityBoosts(run),0);
 run.combat.activeBySide[0]=[-1,1];assert.equal(classicDoubleAbilityBoosts(run),0);
 delete run.combat;assert.equal(classicDoubleAbilityBoosts(run),0);
});
test('two Gas owners suppress their other encounter abilities; transformed Gas is not a source',()=>{
 const run=fixture(),native=run.combat.snapshot.sides[0].pokemon;run.party[0].roguePassiveAbility='neutralizinggas';native[1].ability='neutralizinggas';
 assert.equal(classicDoubleAbilityBoosts(run),0);
 native[1].transformed=true;assert.equal(classicDoubleAbilityBoosts(run),1);
});

function wildFixture(wave){return {id:'source-wild-double',wave,biome:0,biomeStep:wave,rng:12345,party:[makeReferenceMon(151,20,{boxId:'solo',moves:['Splash']})],modifiers:['lure','superlure','maxlure'].map(id=>({id,count:1,remaining:10})),tools:{},balls:{pokeball:5}};}
test('source wild-double roll also applies with a single usable starter, including wave one',()=>{
 for(const wave of [1,2]){
  const run=wildFixture(wave),encounter=classicEncounter(run);assert.equal(encounter.kind,'wild');assert.equal(encounter.doubles,true);assert.equal(encounter.team.length,2);
  run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{doubles:encounter.doubles});
  const native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active.filter(Boolean).length,1);assert.equal(native.p1.active[1],null);assert.equal(native.p2.active.filter(Boolean).length,2);
 }
});
test('ordinary X0 bosses can be doubles; the fixed final encounter remains singles',()=>{
 const run=wildFixture(10),encounter=classicEncounter(run);assert.equal(encounter.kind,'wild');assert.equal(encounter.boss,true);assert.equal(encounter.doubles,true);assert.equal(encounter.team.length,2);assert.ok(encounter.team.every(p=>p.rogueBoss&&p.rogueBossSegments>=2));
 const final=classicEncounter(wildFixture(200));assert.equal(final.kind,'final');assert.equal(final.doubles,false);assert.equal(final.team.length,1);
});
test('the six mandatory double trainer classes stay double against a solo player',()=>{
 for(const trainerId of [4,28,31,36,58,62])for(const wave of [2,50,110]){
  const run=wildFixture(wave),encounter=classicTrainerEncounter(run,trainerId,{kind:'trainer'});
  assert.equal(encounter.doubles,true,`trainer ${trainerId}, wave ${wave}`);assert.ok(encounter.team.length>=2);
 }
});
test('a rolled double trainer promotes a one-member template before creating its party',()=>{
 const run=wildFixture(2);run.trainerTemplates={'2:5':'ONE_STRONG'};const encounter=classicTrainerEncounter(run,5,{kind:'trainer'});
 assert.equal(encounter.doubles,true);assert.equal(encounter.template,'ONE_STRONG');assert.equal(encounter.team.length,2);
 assert.equal(encounter.team[0].level,encounter.team[1].level);
 assert.notEqual(encounter.team[0].boxId,encounter.team[1].boxId);
 run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{doubles:encounter.doubles,trainer:true});
 const native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active.filter(Boolean).length,1);assert.equal(native.p2.active.filter(Boolean).length,2);
});
