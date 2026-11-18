import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function setup(){const hero=makeReferenceMon(150,50,{boxId:'hero',moves:['Earthquake']}),ally=makeReferenceMon(143,50,{boxId:'ally',moves:['Splash']}),foes=[makeReferenceMon(143,50,{boxId:'foe1',moves:['Splash']}),makeReferenceMon(143,50,{boxId:'foe2',moves:['Splash']})];const run={id:'metadata',wave:20,rng:42,party:[hero,ally],modifiers:[{id:'gripclaw',boxId:'hero',count:5},{id:'soothebell',boxId:'hero',count:1,transferable:false},{id:'soothebell',boxId:'ally',count:1,transferable:false},{id:'soothebell',boxId:'ally',count:1}],tools:{},encounter:{kind:'trainer'},gripClawRule:'source-v2'};run.combat=createClassicCombat(run,foes,{trainer:true,doubles:true});return run;}
const amounts=(rows,owner)=>({bound:rows.filter(m=>m.id==='soothebell'&&m.boxId===owner&&m.transferable===false).reduce((n,m)=>n+m.count,0),free:rows.filter(m=>m.id==='soothebell'&&m.boxId===owner&&m.transferable!==false).reduce((n,m)=>n+m.count,0)});
test('ally Grip Claw transfers the selected free item without changing bound records',async()=>{
 const run=setup(),b=restoreClassicNativeBattle(run.combat,run);b.randomChance=()=>true;b.runEvent('DamagingHit',b.p1.active[1],b.p1.active[0],b.dex.moves.get('tackle'),5);
 for(const ledger of [run.modifiers,run.combat.modifiers]){assert.deepEqual(amounts(ledger,'ally'),{bound:1,free:0});assert.deepEqual(amounts(ledger,'hero'),{bound:1,free:1});}
 run.combat.snapshot=snapshotClassicNativeBattle(b);const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(amounts(saved.run.modifiers,'ally'),{bound:1,free:0});assert.deepEqual(amounts(saved.run.modifiers,'hero'),{bound:1,free:1});assert.deepEqual(saved.other,{safe:true});restoreClassicNativeBattle(saved.run.combat,saved.run);
});
test('mini black hole keeps a bound item separate from a newly absorbed item',async()=>{
 const hero=makeReferenceMon(150,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']});foe.rogueFixedModifiers=[{id:'soothebell',count:1}];const run={id:'black-hole',seed:'black-hole',wave:20,party:[hero],modifiers:[{id:'miniblackhole',boxId:'hero',count:1},{id:'soothebell',boxId:'hero',count:1,transferable:false}],tools:{},encounter:{kind:'trainer'}};run.combat=createClassicCombat(run,[foe],{trainer:true});run.combat=playClassicCombat(run,{type:'move',move:'splash'});
 for(const ledger of [run.modifiers,run.combat.modifiers])assert.deepEqual(amounts(ledger,'hero'),{bound:1,free:1});const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(amounts(saved.run.modifiers,'hero'),{bound:1,free:1});assert.deepEqual(saved.other,{safe:true});
});
test('opponent mini black hole removes the free player item without consuming the bound one',async()=>{
 const hero=makeReferenceMon(150,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']});foe.rogueFixedModifiers=[{id:'miniblackhole',count:1,transferable:false}];const run={id:'enemy-hole',seed:'enemy-hole',wave:20,party:[hero],modifiers:[{id:'soothebell',boxId:'hero',count:1,transferable:false},{id:'soothebell',boxId:'hero',count:1}],tools:{},encounter:{kind:'trainer'}};run.combat=createClassicCombat(run,[foe],{trainer:true});run.combat=playClassicCombat(run,{type:'move',move:'splash'});
 for(const ledger of [run.modifiers,run.combat.modifiers])assert.deepEqual(amounts(ledger,'hero'),{bound:1,free:0});const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(amounts(saved.run.modifiers,'hero'),{bound:1,free:0});assert.deepEqual(saved.other,{safe:true});
});
test('actual double battle move keeps distinct item metadata after save',async()=>{
 const run=setup(),b=restoreClassicNativeBattle(run.combat,run),random=b.randomChance;b.randomChance=function(n,d){return d===10?true:random.call(this,n,d);};b.makeChoices('move earthquake, move splash','move splash, move splash');
 for(const ledger of [run.modifiers,run.combat.modifiers]){assert.deepEqual(amounts(ledger,'ally'),{bound:1,free:0});assert.deepEqual(amounts(ledger,'hero'),{bound:1,free:1});}
 run.combat.snapshot=snapshotClassicNativeBattle(b);const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(amounts(saved.run.modifiers,'hero'),{bound:1,free:1});assert.deepEqual(amounts(saved.run.modifiers,'ally'),{bound:1,free:0});assert.deepEqual(saved.other,{safe:true});assert.ok(restoreClassicNativeBattle(saved.run.combat,saved.run).p1.active[0]);
});
