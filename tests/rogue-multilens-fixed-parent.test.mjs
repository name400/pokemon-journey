import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(move,count,ability='parentalbond',rule='source-subset-v2'){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:[move]}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});
 hero.ability=ability;const run={id:'lens-fixed',wave:20,party:[hero],modifiers:[{id:'multilens',boxId:'hero',count}],tools:{},encounter:{kind:'trainer'},multiLensRule:rule};
 run.combat=createClassicCombat(run,[foe],{trainer:true});return run;
}
async function hitDamage(run,move){
 const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=doc.run;
 const b=restoreClassicNativeBattle(run.combat,run),hits=[];b.randomChance=()=>true;
 b.onEvent('Damage',b.format,{priority:-100},function(value,target,source,effect){if(source?.side===this.p1&&effect?.id===move)hits.push(value);});
 b.makeChoices(`move ${move}`,'move splash');assert.deepEqual(doc.other,{keep:true});return hits;
}
test('parental strike retains full fixed damage after lens hits',async()=>{
 for(const count of [1,2]){
  const hits=await hitDamage(fixture('Seismic Toss',count),'seismictoss');
  assert.deepEqual(hits,[Math.floor(50*(1-count*.25)),...Array(count).fill(12),50]);
 }
});
test('half-HP attacks use initial HP for lens hits and current HP for parental hit',async()=>{
 for(const [move,id] of [['Super Fang','superfang'],["Nature's Madness",'naturesmadness'],['Ruination','ruination']]){
  for(const count of [1,2]){
   const run=fixture(move,count),hp=run.combat.teams[1][0].hp,base=Math.floor(hp/2);
   const first=Math.floor(base*(1-count*.25)),extra=Math.floor(base*.25),last=Math.floor((hp-first-extra*count)/2);
   assert.deepEqual(await hitDamage(run,id),[first,...Array(count).fill(extra),last],`${id}:${count}`);
  }
 }
});
test('old games retain previous fixed-damage strike behavior',async()=>{
 assert.deepEqual(await hitDamage(fixture('Seismic Toss',1,'parentalbond','source-subset-v1'),'seismictoss'),[37,12,12]);
});
test('without parental bond the first target HP is still shared across lens hits',async()=>{
 const run=fixture('Super Fang',2,'synchronize'),hp=run.combat.teams[1][0].hp,base=Math.floor(hp/2);
 assert.deepEqual(await hitDamage(run,'superfang'),[Math.floor(base*.5),Math.floor(base*.25),Math.floor(base*.25)]);
});
test('a later use starts a fresh half-HP calculation',()=>{
 const run=fixture('Super Fang',1,'synchronize'),b=restoreClassicNativeBattle(run.combat,run),foe=b.p2.active[0];b.randomChance=()=>true;
 const execute=()=>{const hp=foe.hp,base=Math.floor(hp/2);b.makeChoices('move superfang','move splash');assert.equal(foe.hp,hp-Math.floor(base*.75)-Math.floor(base*.25));};
 execute();execute();
});
test('new runs use v2 and can still receive Multi Lens rewards',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs'),{generateClassicRewardsWithTiers}=await import('../lib/rogue-classic-rewards.mjs');
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'lens-v2',seed:'lens-v2'});
 assert.equal(run.multiLensRule,'source-subset-v2');assert.deepEqual(state.slots[1],{keep:true});
 run.screen='reward';run.wave=23;let seen=false;for(let seed=1;seed<=1000&&!seen;seed++){run.rng=seed*1234567>>>0;seen=generateClassicRewardsWithTiers(run,[4]).some(x=>x.id==='multilens');}assert.equal(seen,true);
});
