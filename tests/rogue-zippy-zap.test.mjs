import test from 'node:test';import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,classicCombatView,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {classicMetronomeMoves} from '../lib/rogue-called-move-policy.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(rule,called=false,ability='pressure'){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:[called?'Metronome':'Zippy Zap']}),foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});foe.ability=ability;
 const run={id:'zippy-test',wave:20,rng:42,party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},calledMoveRule:'source-pool-v1',...(rule?{zippyZapRule:rule}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});return run;
}
test('source damage and guaranteed critical hit replace the native evasion effect',()=>{
 for(const rule of ['source-v1',null]){const run=fixture(rule),b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0],m=b.dex.moves.get('zippyzap');
  assert.equal(m.basePower,rule?50:80);assert.equal(classicCombatView(run.combat).requests[0].moves[0].power,rule?50:80);assert.equal(!!m.willCrit,!!rule);assert.equal(m.priority,2);b.makeChoices('move zippyzap','move splash');
  assert.equal(hero.boosts.evasion,rule?0:1);assert.equal(b.log.some(line=>line.includes('|-crit|')),!!rule);
 }
 assert.equal(Dex.moves.get('zippyzap').basePower,80);assert.ok(Dex.moves.get('zippyzap').secondaries);
});
test('critical-hit immunity still blocks the guaranteed critical',()=>{
 const run=fixture('source-v1',false,'battlearmor'),b=restoreClassicNativeBattle(run.combat,run);b.makeChoices('move zippyzap','move splash');assert.equal(b.log.some(line=>line.includes('|-crit|')),false);assert.equal(b.p1.active[0].boosts.evasion,0);
});
test('Metronome uses the same corrected move and preserves unrelated save data after recovery',async()=>{
 const run=fixture('source-v1',true),b=restoreClassicNativeBattle(run.combat,run),sample=b.sample.bind(b),seen=[];
 b.sample=values=>values===classicMetronomeMoves?'zippyzap':sample(values);b.onEvent('PrepareHit',b.format,{priority:-100},function(source,target,move){if(move.id==='zippyzap')seen.push(move.basePower);});
 b.makeChoices('move metronome','move splash');assert.deepEqual(seen,[50]);assert.equal(b.p1.active[0].boosts.evasion,0);assert.ok(b.log.some(line=>line.includes('|-crit|')));
 run.combat.snapshot=snapshotClassicNativeBattle(b);const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}}));const restored=restoreClassicNativeBattle(saved.run.combat,saved.run);assert.equal(restored.dex.moves.get('zippyzap').basePower,50);assert.deepEqual(saved.other,{keep:true});
});
test('a new run selects the corrected rule without changing other slots',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'zippy-v1',seed:'zippy-v1'});assert.equal(run.zippyZapRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
