import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

// Observes the current behavior, not the desired source rule. No production
// dex object, persistent save, or shared RNG is changed by these fixtures.
function battle({move='Tackle',ability='pressure',terrain,attackerId=151,attackerPassive,item}={}) {
 const mon=(id,boxId,ability,moves)=>makeReferenceMon(id,50,{boxId,ability,moves});
 const attacker=mon(attackerId,'attacker',ability,[move]);if(attackerPassive)attacker.roguePassiveAbility=attackerPassive;
 const run={id:'effect-spore-audit',seed:'effect-spore-audit',rng:42,wave:20,screen:'battle',party:[attacker],modifiers:[],tools:{},encounter:{kind:'trainer'}};
 run.combat=createClassicCombat(run,[mon(591,'defender','effectspore',['Splash'])],{trainer:true});
 const b=restoreClassicNativeBattle(run.combat,run);
 if(terrain)b.field.setTerrain(terrain,b.p2.active[0],b.dex.moves.get(terrain));
 if(item)b.p1.active[0].setItem(item);
 const native=b.dex,local=Object.create(native),original=native.abilities.get('effectspore'),calls=[],hits=[];
 const wrapped=new native.Ability({...original,onDamagingHit(damage,target,source,attack){
  hits.push(attack.id);
  const random=this.random;
  this.random=function(max,...rest){if(max===100){calls.push(max);return 20;}return random.call(this,max,...rest);};
  try{return original.onDamagingHit.call(this,damage,target,source,attack);}finally{this.random=random;}
 }});
 Object.defineProperty(local,'abilities',{value:new Proxy(native.abilities,{get(target,key){
  if(key==='get'||key==='getByID')return name=>{const result=target[key](name);return result.id==='effectspore'?wrapped:result;};
  const result=Reflect.get(target,key,target);return typeof result==='function'?result.bind(target):result;
 }})});
 b.dex=local;
 return {b,calls,hits};
}

for(const [label,move] of [['Tackle','tackle'],['Bite','bite']])test(`native Effect Spore can paralyze on roll 20 after ${label}`,()=>{
 const {b,calls}=battle({move:label});b.makeChoices(`move ${move}`,'move splash');
 assert.deepEqual(calls,[100]);assert.equal(b.p1.active[0].status,'par');
});
test('native noncontact hit runs callback without consuming Effect Spore RNG',()=>{
 const {b,calls,hits}=battle({move:'Thunderbolt'});b.makeChoices('move thunderbolt','move splash');
 assert.deepEqual(hits,['thunderbolt']);assert.deepEqual(calls,[]);assert.equal(b.p1.active[0].status,'');
});
test('a substitute blocks the native damaging-hit callback',()=>{
 const {b,calls,hits}=battle();b.p2.active[0].addVolatile('substitute');b.makeChoices('move tackle','move splash');
 assert.deepEqual(hits,[]);assert.deepEqual(calls,[]);assert.equal(b.p1.active[0].status,'');
});
for(const setup of [{attackerId:1},{ability:'overcoat'},{attackerPassive:'overcoat'},{item:'safetygoggles'}])test(`native powder immunity avoids the status roll: ${JSON.stringify(setup)}`,()=>{
 const {b,calls,hits}=battle(setup);b.makeChoices('move tackle','move splash');
 assert.deepEqual(hits,['tackle']);assert.deepEqual(calls,[]);assert.equal(b.p1.active[0].status,'');
});
for(const setup of [{ability:'limber'},{terrain:'mistyterrain'}])test(`type immunity alone cannot preflight SetStatus: ${JSON.stringify(setup)}`,()=>{
 const {b,calls}=battle(setup),attacker=b.p1.active[0];
 assert.equal(attacker.runStatusImmunity('par'),true);
 b.makeChoices('move tackle','move splash');assert.deepEqual(calls,[100]);assert.equal(attacker.status,'');
});

function multihit({passive=false,roll=20,suppress=false}={}) {
 const attacker=makeReferenceMon(151,50,{boxId:'attacker',moves:['Double Slap'],ability:'pressure'});
 const defender=makeReferenceMon(591,50,{boxId:'defender',moves:['Splash'],ability:passive?'pressure':'effectspore'});
 if(passive)defender.roguePassiveAbility='effectspore';
 const run={id:'spore-multihit-audit',seed:'spore-multihit-audit',rng:42,wave:20,screen:'battle',party:[attacker],modifiers:[],tools:{},encounter:{kind:'trainer'}};
 run.combat=createClassicCombat(run,[defender],{trainer:true});
 const b=restoreClassicNativeBattle(run.combat,run),calls=[],random=b.random,sample=b.sample;
 if(suppress)b.p2.active[0].addVolatile('gastroacid');
 b.sample=function(values){if(Array.isArray(values)&&values.length===20&&values[0]===2&&values.at(-1)===5)return 3;return sample.call(this,values);};
 b.random=function(max,...rest){if(max===100&&this.effect?.id==='effectspore'){calls.push({max,event:this.event?.id});return roll;}return random.call(this,max,...rest);};
 b.makeChoices('move doubleslap','move splash');
 return {b,calls,run};
}
for(const passive of [false,true]){
 test(`${passive?'passive':'ordinary'} Effect Spore rolls once per hit even after paralysis`,()=>{
  const {b,calls,run}=multihit({passive});
  assert.deepEqual(calls,[{max:100,event:'DamagingHit'},{max:100,event:'DamagingHit'},{max:100,event:'DamagingHit'}]);
  assert.equal(b.p1.active[0].status,'par');assert.ok(b.log.some(line=>line.includes('|-hitcount|')&&line.endsWith('|3')));
  run.combat.snapshot=snapshotClassicNativeBattle(b);const saved=JSON.parse(JSON.stringify(run)),restored=restoreClassicNativeBattle(saved.combat,saved);
  assert.equal(restored.p1.active[0].status,'par');assert.equal(restored.p1.active[0].hp,b.p1.active[0].hp);
  assert.equal(restored.p2.active[0].hp,b.p2.active[0].hp);assert.equal(restored.p2.active[0].hasAbility('effectspore'),true);
 });
 test(`${passive?'passive':'ordinary'} Effect Spore sleep interrupts remaining hits`,()=>{
  const {b,calls}=multihit({passive,roll:0});assert.deepEqual(calls,[{max:100,event:'DamagingHit'}]);
  assert.equal(b.p1.active[0].status,'slp');assert.ok(b.log.some(line=>line.includes('|-hitcount|')&&line.endsWith('|1')));
 });
 test(`${passive?'passive':'ordinary'} Effect Spore is suppressed by Gastro Acid`,()=>{
  const {b,calls}=multihit({passive,suppress:true});assert.deepEqual(calls,[]);assert.equal(b.p1.active[0].status,'');
 });
}
test('two contact attacks in doubles dispatch to the respective Effect Spore owner',()=>{
 const mon=(id,boxId,ability,moves)=>makeReferenceMon(id,50,{boxId,ability,moves});
 const run={id:'spore-double-audit',seed:'spore-double-audit',rng:42,wave:20,screen:'battle',party:[mon(151,'a','pressure',['Tackle']),mon(143,'ally','pressure',['Tackle'])],modifiers:[],tools:{},encounter:{kind:'trainer'}};
 const first=mon(591,'one','effectspore',['Splash']),second=mon(591,'two','pressure',['Splash']);second.roguePassiveAbility='effectspore';
 run.combat=createClassicCombat(run,[first,second],{trainer:true,doubles:true});
 const b=restoreClassicNativeBattle(run.combat,run),calls=[],random=b.random;
 b.random=function(max,...rest){if(max===100&&this.effect?.id==='effectspore'){calls.push({owner:this.effectState.target?.set?.trainerToken,event:this.event?.id});return 99;}return random.call(this,max,...rest);};
 b.makeChoices('move tackle 1,move tackle 2','move splash,move splash');
 assert.deepEqual(calls,[{owner:'one',event:'DamagingHit'},{owner:'two',event:'DamagingHit'}]);
 assert.equal(b.p1.active[0].status,'');assert.equal(b.p1.active[1].status,'');
});
for(const limberPassive of [false,true])test(`mid-hit clone rejects paralysis with ${limberPassive?'passive':'ordinary'} Limber without changing live snapshot`,()=>{
 const attacker=makeReferenceMon(151,50,{boxId:'a',moves:['Tackle'],ability:limberPassive?'pressure':'limber'});
 if(limberPassive)attacker.roguePassiveAbility='limber';
 const defender=makeReferenceMon(591,50,{boxId:'d',moves:['Splash'],ability:'pressure'});defender.roguePassiveAbility='effectspore';
 const run={id:'spore-clone-audit',seed:'spore-clone-audit',rng:42,wave:20,screen:'battle',party:[attacker],modifiers:[],tools:{},encounter:{kind:'trainer'}};
 run.combat=createClassicCombat(run,[defender],{trainer:true});
 const b=restoreClassicNativeBattle(run.combat,run),random=b.random;let observed=false;
 b.random=function(max,...rest){
  if(max!==100||this.effect?.id!=='effectspore')return random.call(this,max,...rest);
  observed=true;
  const before={seed:this.prng.getSeed(),log:this.log.length,hp:this.p1.active[0].hp,defenderHp:this.p2.active[0].hp,status:this.p1.active[0].status,event:this.event,effect:this.effect,depth:this.eventDepth};
  const snapshot=snapshotClassicNativeBattle(this),copy=restoreClassicNativeBattle({...run.combat,snapshot},run);
  assert.equal(copy.p1.active[0].hasAbility('limber'),true);assert.equal(copy.p2.active[0].hasAbility('effectspore'),true);
  assert.equal(copy.p1.active[0].trySetStatus('par',copy.p2.active[0],copy.dex.abilities.get('effectspore')),false);
  assert.equal(this.prng.getSeed(),before.seed);assert.equal(this.log.length,before.log);assert.equal(this.p1.active[0].status,before.status);
  assert.equal(this.p1.active[0].hp,before.hp);assert.equal(this.p2.active[0].hp,before.defenderHp);
  assert.equal(this.event,before.event);assert.equal(this.effect,before.effect);assert.equal(this.eventDepth,before.depth);
  return 99;
 };
 b.makeChoices('move tackle','move splash');assert.equal(observed,true);assert.equal(b.p1.active[0].status,'');
});
