import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({rule='source-v3',count=0,charm=0,move='Seismic Toss',doubles=false}={}){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:[move]}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']}),ally=makeReferenceMon(143,100,{boxId:'ally',moves:['Splash']}),foe2=makeReferenceMon(143,100,{boxId:'foe2',moves:['Splash']});
 hero.hp=30;hero.item='shellbell';const modifiers=[];if(count)modifiers.push({id:'shellbell',boxId:'hero',count,typeBoost:null});if(charm)modifiers.push({id:'healingcharm',count:charm});
 const run={id:'shell-native',wave:20,rng:42,party:doubles?[hero,ally]:[hero],modifiers,tools:{},encounter:{kind:'trainer'},shellBellRule:rule};run.combat=createClassicCombat(run,doubles?[foe,foe2]:[foe],{trainer:true,doubles});return run;
}
test('native and modifier stacks heal once from direct or substitute damage, with healing charm applied once',async()=>{
 for(const sub of [false,true])for(const count of [0,1,3])for(const charm of [0,2]){
  const doc=await decodeGameData(await encodeGameData({run:fixture({count,charm}),other:{keep:true}})),run=doc.run,b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],before=hero.hp;
  if(sub)b.p2.active[0].addVolatile('substitute');b.makeChoices('move seismictoss','move splash');
  const base=Math.max(1,Math.floor(50*(1+count)/8)),expected=Math.floor(base*(1+.1*charm));assert.equal(hero.hp,before+expected,`sub=${sub} count=${count} charm=${charm}`);assert.deepEqual(doc.other,{keep:true});
 }
});
test('mixed spread damage is summed before native and modifier healing and charm rounding',()=>{
 const run=fixture({count:2,charm:2,move:'Earthquake',doubles:true}),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],before=hero.hp,hits=[];
 for(const event of ['AfterSubDamage','DamagingHit'])b.onEvent(event,b.format,{priority:-50},function(d,t,s,m){if(s===hero&&m?.id==='earthquake')hits.push(d);});
 b.p2.active[0].addVolatile('substitute');b.makeChoices('move earthquake, move splash','move splash, move splash');
 const total=hits.reduce((a,n)=>a+n,0);assert.ok(hits.length>=3);assert.equal(hero.hp,Math.min(hero.maxhp,before+Math.floor(Math.floor(total*3/8)*1.2)));
});
test('native-only healing still works without access to the parent run',()=>{
 const run=fixture(),b=restoreClassicNativeBattle(run.combat),hero=b.p1.active[0];b.p2.active[0].addVolatile('substitute');b.makeChoices('move seismictoss','move splash');assert.equal(hero.hp,36);
});
test('v2 legacy rules retain their prior native and modifier treatment',()=>{
 const run=fixture({rule:'source-v2',count:3}),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0];b.p2.active[0].addVolatile('substitute');b.makeChoices('move seismictoss','move splash');assert.equal(hero.hp,48);
});
test('status moves do not activate native shell bell',()=>{
 const run=fixture({count:3,move:'Splash'}),b=restoreClassicNativeBattle(run.combat,run);b.makeChoices('move splash','move splash');assert.equal(b.p1.pokemon[0].hp,30);
});
test('healing is blocked by Heal Block and does not leak into subsequent moves',()=>{
 const run=fixture({count:3}),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0];hero.addVolatile('healblock');
 b.makeChoices('move seismictoss','move splash');assert.equal(hero.hp,30);hero.removeVolatile('healblock');
 b.makeChoices('move seismictoss','move splash');assert.equal(hero.hp,55);
});
test('healing is capped at maximum HP',()=>{
 const run=fixture({count:3,charm:5}),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0];hero.hp=hero.maxhp-1;
 b.makeChoices('move seismictoss','move splash');assert.equal(hero.hp,hero.maxhp);
});
