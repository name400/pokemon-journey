import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,continueClassicWild,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
for(const move of ['Fake Out','First Impression'])test(`${move} can be used on the first turn of the next continuous wild wave`,async()=>{
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:[move]}),weak=makeReferenceMon(19,1,{boxId:'first',moves:['Splash']});weak.hp=1;
 let run={id:'first-wave',seed:'first-wave',rng:42,wave:21,biome:0,party:[hero],tools:{},modifiers:[],encounter:{kind:'wild'}};run.combat=createClassicCombat(run,[weak]);run.combat=playClassicCombat(run,{type:'move',move:move.toLowerCase().replaceAll(' ','')});assert.ok(run.combat.ended);run.party=run.combat.teams[0];run.wave++;run.combat=continueClassicWild(run,[makeReferenceMon(143,100,{boxId:'next',moves:['Splash']})]);run.party=run.combat.teams[0];
 const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=doc.run;let b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].activeMoveActions,0);const hp=b.p2.active[0].hp;
 run.combat=playClassicCombat(run,{type:'move',move:move.toLowerCase().replaceAll(' ','')});b=restoreClassicNativeBattle(run.combat,run);assert.ok(b.p2.active[0].hp<hp);assert.deepEqual(doc.other,{keep:true});
});
