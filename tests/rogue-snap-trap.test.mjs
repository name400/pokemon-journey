import test from 'node:test';import assert from 'node:assert/strict';import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,classicCombatView,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {classicMetronomeMoves} from '../lib/rogue-called-move-policy.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(modern=true,called=false){const hero=makeReferenceMon(151,50,{boxId:'hero',moves:[called?'Metronome':'Snap Trap']}),foe=makeReferenceMon(9,100,{boxId:'foe',moves:['Splash']});const run={id:'snap-trap',wave:20,rng:42,party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},calledMoveRule:'source-pool-v1',...(modern?{snapTrapRule:'source-v1',typeItemRule:'source-v2'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});return run;}
test('source Steel type reaches battle UI and actual Water-type effectiveness',()=>{
 for(const modern of [true,false]){const run=fixture(modern),view=classicCombatView(run.combat).requests[0].moves[0],b=restoreClassicNativeBattle(run.combat,run),seen=[];assert.equal(view.typeKey,modern?'steel':'grass');assert.equal(view.effectiveness,modern?.5:2);
  b.onEvent('PrepareHit',b.format,{priority:-100},function(p,t,m){if(m.id==='snaptrap')seen.push(m.type);});b.makeChoices('move snaptrap','move splash');assert.deepEqual(seen,[modern?'Steel':'Grass']);assert.ok(b.log.some(line=>line.includes(modern?'|-resisted|':'|-supereffective|')));assert.ok(b.p2.active[0].volatiles.partiallytrapped);
 }
 assert.equal(Dex.moves.get('snaptrap').type,'Grass');
});
test('source type boosters follow Steel instead of Grass',()=>{
 for(const type of ['Steel','Grass']){const run=fixture();run.modifiers=[{id:'typebooster',typeBoost:type,boxId:'hero',count:1}];run.combat.modifiers=structuredClone(run.modifiers);const b=restoreClassicNativeBattle(run.combat,run),p=b.p1.active[0],foe=b.p2.active[0];assert.equal(b.runEvent('BasePower',p,foe,b.dex.moves.get('snaptrap'),35),type==='Steel'?42:35);}
});
test('Metronome uses source type and the bind remains after save recovery',async()=>{
 const run=fixture(true,true),b=restoreClassicNativeBattle(run.combat,run),sample=b.sample.bind(b),seen=[];b.sample=values=>values===classicMetronomeMoves?'snaptrap':sample(values);
 b.onEvent('PrepareHit',b.format,{priority:-100},function(p,t,m){if(m.id==='snaptrap')seen.push(m.type);});b.makeChoices('move metronome','move splash');assert.deepEqual(seen,['Steel']);assert.ok(b.p2.active[0].volatiles.partiallytrapped);
 run.combat.snapshot=snapshotClassicNativeBattle(b);const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}})),restored=restoreClassicNativeBattle(doc.run.combat,doc.run);assert.equal(restored.dex.moves.get('snaptrap').type,'Steel');assert.ok(restored.p2.active[0].volatiles.partiallytrapped);assert.deepEqual(doc.other,{keep:true});
});
test('Normalize can still change the corrected type',()=>{
 const run=fixture(),b=restoreClassicNativeBattle(run.combat,run),seen=[];b.p1.active[0].setAbility('normalize');b.onEvent('PrepareHit',b.format,{priority:-100},function(p,t,m){if(m.id==='snaptrap')seen.push(m.type);});b.makeChoices('move snaptrap','move splash');assert.deepEqual(seen,['Normal']);
});
test('learning screen displays the selected run type for a pending move',async()=>{
 const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{classicGameView}=await import('../lib/rogue-classic-game.mjs');
 for(const modern of [true,false]){const doc={},state=ensureClassicState(doc),run=fixture(modern);run.party[0].moves=['Splash','Tackle','Growl','Protect'];run.screen='learn';run.afterLearn='reward';run.pendingMoves=[{boxId:'hero',move:'Snap Trap',level:50}];state.slots[0]=run;
  const move=classicGameView(doc).run.learning.newMove;assert.equal(move.typeKey,modern?'steel':'grass');assert.equal(move.type,modern?'강철':'풀');}
});
test('new starts select the rule without changing other slots',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'snap',seed:'snap'});assert.equal(run.snapTrapRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
