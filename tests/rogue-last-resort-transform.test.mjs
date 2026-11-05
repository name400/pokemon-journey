import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
function play(run,move){run.combat=playClassicCombat(run,{type:'move',move});run.party=run.combat.teams[0];}
async function reload(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));assert.deepEqual(doc.other,{keep:true});return doc.run;}
function fixture(modern=true){const hero=makeReferenceMon(132,50,{boxId:'hero',moves:['Splash','Transform']}),foe=makeReferenceMon(242,50,{boxId:'foe',moves:['Splash','Last Resort']});const run={id:'transform-history',seed:'transform-history',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},...(modern?{lastResortHistoryRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});return run;}
test('moves used before Transform remain in the current summon history after save recovery',async()=>{
 let run=fixture();play(run,'splash');play(run,'transform');run=await reload(run);let b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0];assert.equal(hero.transformed,true);assert.equal(hero.moveSlots.find(s=>s.id==='splash').used,true);const before=b.p2.active[0].hp;play(run,'lastresort');b=restoreClassicNativeBattle(run.combat,run);assert.ok(b.p2.active[0].hp<before);
});
test('legacy Transform keeps the previous copied move history behavior',async()=>{let run=fixture(false);play(run,'splash');play(run,'transform');run=await reload(run);const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].moveSlots.find(s=>s.id==='splash').used,false);});
test('a newly copied move is not counted until the transformed Pokemon uses it',async()=>{let run=fixture();play(run,'transform');run=await reload(run);let b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].moveSlots.find(s=>s.id==='splash').used,false);const before=b.p2.active[0].hp;play(run,'lastresort');b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p2.active[0].hp,before);play(run,'splash');run=await reload(run);play(run,'lastresort');b=restoreClassicNativeBattle(run.combat,run);assert.ok(b.p2.active[0].hp<before);});
