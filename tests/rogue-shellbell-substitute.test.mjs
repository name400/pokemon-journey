import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(rule,move='Seismic Toss',doubles=false,count=4){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:[move]}),ally=makeReferenceMon(143,100,{boxId:'ally',moves:['Splash']}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']}),foe2=makeReferenceMon(143,100,{boxId:'foe2',moves:['Splash']});hero.hp=30;
 const run={id:'shell-sub',wave:20,rng:42,party:doubles?[hero,ally]:[hero],modifiers:count?[{id:'shellbell',boxId:'hero',count,typeBoost:null}]:[],tools:{},encounter:{kind:'trainer'},...(rule?{shellBellRule:rule}:{})};
 run.combat=createClassicCombat(run,doubles?[foe,foe2]:[foe],{trainer:true,doubles});return run;
}
function observe(b,id){const sub=[],normal=[];b.onEvent('AfterSubDamage',b.format,{priority:-50},function(d,t,s,m){if(s?.side===this.p1&&m?.id===id)sub.push(d);});b.onEvent('DamagingHit',b.format,{priority:-50},function(d,t,s,m){if(s?.side===this.p1&&m?.id===id)normal.push(d);});return {sub,normal};}
test('actual damage to a substitute contributes to healing for new runs only',async()=>{
 for(const rule of ['source-v2',null]){
  const doc=await decodeGameData(await encodeGameData({run:fixture(rule),other:{keep:true}})),run=doc.run,b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],foe=b.p2.active[0],seen=observe(b,'seismictoss'),before=hero.hp,foeHp=foe.hp;
  foe.addVolatile('substitute');b.makeChoices('move seismictoss','move splash');assert.deepEqual(seen.sub,[50]);assert.equal(foe.hp,foeHp);
  assert.equal(hero.hp,before+(rule?25:0));assert.deepEqual(doc.other,{keep:true});
 }
});
test('multi-hit substitute damage is summed and capped to its remaining HP',()=>{
 const run=fixture('source-v2','Bullet Seed'),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],foe=b.p2.active[0],seen=observe(b,'bulletseed'),before=hero.hp;
 foe.addVolatile('substitute');foe.volatiles.substitute.hp=20;b.makeChoices('move bulletseed','move splash');
 const total=[...seen.sub,...seen.normal].reduce((a,n)=>a+n,0);assert.ok(seen.sub.length>0);assert.ok(seen.sub.reduce((a,n)=>a+n,0)<=20);assert.equal(hero.hp,Math.min(hero.maxhp,before+Math.max(1,Math.floor(total*4/8))));
});
test('spread attack combines substitute and normal damage once',()=>{
 const run=fixture('source-v2','Earthquake',true,1),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],foe=b.p2.active[0],seen=observe(b,'earthquake'),before=hero.hp;
 foe.addVolatile('substitute');b.makeChoices('move earthquake, move splash','move splash, move splash');
 assert.ok(seen.sub.length);assert.ok(seen.normal.length);const total=[...seen.sub,...seen.normal].reduce((a,n)=>a+n,0);
 assert.equal(hero.hp,Math.min(hero.maxhp,before+Math.max(1,Math.floor(total/8))));
});
test('independent combat restore keeps the rule; holders without Shell Bell do not heal',()=>{
 for(const count of [0,4]){const run=fixture('source-v2','Seismic Toss',false,count),b=restoreClassicNativeBattle(run.combat),hero=b.p1.active[0],before=hero.hp;b.p2.active[0].addVolatile('substitute');b.makeChoices('move seismictoss','move splash');assert.equal(run.combat.shellBellRule,'source-v2');assert.equal(hero.hp,before+(count?25:0));}
});
test('opponent-owned modifier heals its holder when hitting a substitute',()=>{
 const hero=makeReferenceMon(151,100,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(143,50,{boxId:'foe',moves:['Seismic Toss']});foe.hp=30;foe.rogueFixedModifiers=[{id:'shellbell',count:4,typeBoost:null}];
 const run={id:'shell-enemy',wave:20,rng:42,party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},shellBellRule:'source-v2'};run.combat=createClassicCombat(run,[foe],{trainer:true});
 const b=restoreClassicNativeBattle(run.combat,run);b.p1.active[0].addVolatile('substitute');b.makeChoices('move splash','move seismictoss');assert.equal(b.p2.pokemon[0].hp,55);
});
test('new games opt in without rewriting another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'shell-v2',seed:'shell-v2'});assert.equal(run.shellBellRule,'source-v2');assert.deepEqual(state.slots[1],{keep:true});
});
