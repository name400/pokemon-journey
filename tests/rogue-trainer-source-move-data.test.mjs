import test from 'node:test';import assert from 'node:assert/strict';import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicStaticMoveStats} from '../lib/rogue-move-balance.mjs';
import {trainerLevelMoves} from '../lib/rogue-trainer-moves.mjs';
import {trainerMoveAlternative} from '../lib/rogue-classic-world.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const source={trainerMoveDataRule:'source-v1',moveBalanceRule:'source-subset-v2',zippyZapRule:'source-v1',darkVoidRule:'source-subset-v1'};

test('trainer data uses the same reviewed power and accuracy as battle without mutating the Dex',()=>{
 for(const [id,power,accuracy] of [['slash',80,100],['geargrind',60,90],['zippyzap',50,100],['darkvoid',0,80],['tackle',40,100]]){const move=Dex.moves.get(id),before={power:move.basePower,accuracy:move.accuracy},actual=classicStaticMoveStats(move,source);assert.equal(actual.basePower,power,id);assert.equal(actual.accuracy,accuracy,id);assert.deepEqual({power:move.basePower,accuracy:move.accuracy},before);assert.deepEqual(classicStaticMoveStats(move,null),{basePower:before.power,accuracy:before.accuracy});}
 assert.equal(classicStaticMoveStats(Dex.moves.get('zippyzap'),{trainerMoveDataRule:'source-v1'}).basePower,80);
});
test('trainer power predicates use the source value while older runs keep the native value',()=>{
 const mon=makeReferenceMon(431,75,{boxId:'foe',moves:['Slash']}),alternative={type:'movePredicate',predicate:{op:'gt',left:{type:'field',scope:'move',path:['power']},right:75}};
 assert.equal(trainerMoveAlternative(mon,alternative,source),true);assert.equal(trainerMoveAlternative(mon,alternative),false);
});
test('real trainer move generation accounts for source power with unchanged input',()=>{
 const mon=makeReferenceMon(431,75,{boxId:'foe'}),before=structuredClone(mon),old=trainerLevelMoves(mon,()=>.5),modern=trainerLevelMoves(mon,()=>.5,{run:source});
 assert.ok(!old.includes('베어가르기'));assert.ok(modern.includes('베어가르기'));assert.deepEqual(mon,before);
});
test('selected trainer move uses the same power in battle and on recovery',async()=>{
 const trainer=makeReferenceMon(431,75,{boxId:'foe'}),hero=makeReferenceMon(143,100,{boxId:'hero',moves:['Splash']}),run={id:'trainer-move-data',wave:50,rng:42,party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},...source};trainer.moves=trainerLevelMoves(trainer,()=>.5,{run});run.combat=createClassicCombat(run,[trainer],{trainer:true});
 const b=restoreClassicNativeBattle(run.combat,run),seen=[];b.onEvent('PrepareHit',b.format,{priority:-100},function(p,t,m){if(p.side===this.p2&&m.id==='slash')seen.push(m.basePower);});b.makeChoices('move splash','move slash');assert.deepEqual(seen,[80]);run.combat.snapshot=snapshotClassicNativeBattle(b);
 const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}})),restored=restoreClassicNativeBattle(saved.run.combat,saved.run);assert.equal(restored.dex.moves.get('slash').basePower,80);assert.deepEqual(saved.other,{keep:true});
});
test('new runs select trainer data rule and preserve other slots',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'trainer-data',seed:'trainer-data'});assert.equal(run.trainerMoveDataRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
