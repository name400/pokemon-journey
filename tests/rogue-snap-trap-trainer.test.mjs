import test from 'node:test';import assert from 'node:assert/strict';
import trainerRules from '../data/rogue-trainer-effects.json' with {type:'json'};
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {trainerLevelMoves} from '../lib/rogue-trainer-moves.mjs';
import {trainerMoveAlternative} from '../lib/rogue-classic-world.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('source trainer type predicate recognizes Snap Trap as Steel',()=>{
 const member=trainerRules.trainers['321'].members.find(m=>m.slot===1),op=member.postProcess.operations.find(o=>o.op==='ensureMove'),mon=makeReferenceMon(4618,50,{boxId:'trainer',moves:['Snap Trap']});
 const before=structuredClone(mon);assert.equal(trainerMoveAlternative(mon,op.acceptableAlternative,{snapTrapRule:'source-v1'}),true);assert.equal(trainerMoveAlternative(mon,op.acceptableAlternative),false);assert.deepEqual(mon,before);
 assert.equal(trainerMoveAlternative(mon,{type:'unknown'},{snapTrapRule:'source-v1'}),undefined);
});
test('trainer move selection treats Snap Trap as Steel without changing legacy selection',()=>{
 const mon=makeReferenceMon(4618,50,{boxId:'trainer'}),before=structuredClone(mon),modern=trainerLevelMoves(mon,()=>.5,{run:{snapTrapRule:'source-v1'}}),old=trainerLevelMoves(mon,()=>.5);
 assert.ok(modern.includes('집게덫'));assert.ok(old.includes('집게덫'));assert.ok(old.includes('러스터캐논'));assert.ok(!modern.includes('러스터캐논'));assert.deepEqual(mon,before);
});
test('selected trainer move remains Steel in actual battle and after recovery',async()=>{
 const hero=makeReferenceMon(9,100,{boxId:'hero',moves:['Splash']}),trainer=makeReferenceMon(4618,50,{boxId:'trainer'}),run={id:'snap-trainer',wave:50,rng:42,party:[hero],modifiers:[],tools:{},snapTrapRule:'source-v1',encounter:{kind:'trainer'}};
 trainer.moves=trainerLevelMoves(trainer,()=>.5,{run});run.combat=createClassicCombat(run,[trainer],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run),seen=[];b.onEvent('PrepareHit',b.format,{priority:-100},function(p,t,m){if(p.side===this.p2&&m.id==='snaptrap')seen.push(m.type);});b.makeChoices('move splash','move snaptrap');assert.deepEqual(seen,['Steel']);assert.ok(b.log.some(line=>line.includes('|-resisted|')));
 run.combat.snapshot=snapshotClassicNativeBattle(b);const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}})),restored=restoreClassicNativeBattle(saved.run.combat,saved.run);assert.equal(restored.dex.moves.get('snaptrap').type,'Steel');assert.deepEqual(saved.other,{keep:true});
});
