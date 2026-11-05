import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicMoveBalance} from '../lib/rogue-move-balance.mjs';
import {createClassicCombat,classicCombatView,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

function fixture(id,modern=true){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:[Dex.moves.get(id).name,'Splash']});hero.ability='pressure';
 const foe=makeReferenceMon(80,100,{boxId:'foe',moves:['Splash']});foe.ability='pressure';
 const r={id:'balance-test',seed:'balance-test',rng:1,wave:1,biome:1,screen:'battle',party:[hero],foes:[foe],modifiers:[],balls:{},tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};
 if(modern)r.moveBalanceRule='source-subset-v1';r.combat=createClassicCombat(r,r.foes,{trainer:true});return r;
}
// Each selected source value reaches the displayed move and a real attack.
for(const [id,patch] of Object.entries(classicMoveBalance)){
 const native=Dex.moves.get(id),nativeStats={power:native.basePower,accuracy:native.accuracy};
 for(const modern of [false,true]){const r=fixture(id,modern),b=restoreClassicNativeBattle(r.combat,r),view=classicCombatView(r.combat).requests[0].moves[0],expected=modern?patch:{};assert.equal(view.power,expected.basePower??native.basePower);assert.equal(view.accuracy,expected.accuracy??native.accuracy);
 let attack;const random=b.randomChance.bind(b);b.randomChance=(n,d)=>d===100?true:random(n,d);b.onEvent('PrepareHit',b.format,{priority:-100},function(p,target,move){if(move.id===id)attack=move;});b.makeChoices('move 1','move 1');assert.ok(attack,id);assert.equal(attack.basePower,expected.basePower??native.basePower);assert.equal(attack.accuracy,expected.accuracy??native.accuracy);assert.ok(b.p2.active[0].hp<b.p2.active[0].maxhp,id);}
 assert.deepEqual({power:Dex.moves.get(id).basePower,accuracy:Dex.moves.get(id).accuracy},nativeStats,'shared Dex must stay unchanged');
}
// Secondary effects and multi-hit behavior still execute with the changed power.
{const r=fixture('firelash'),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 1','move 1');assert.equal(b.p2.active[0].boosts.def,-1);}
{const r=fixture('geargrind'),b=restoreClassicNativeBattle(r.combat,r),original=b.randomChance.bind(b);b.randomChance=(n,d)=>d===100?true:original(n,d);b.makeChoices('move 1','move 1');assert.ok(b.log.some(line=>line.startsWith('|-hitcount|')&&line.endsWith('|2')));}
// A full save restores the rule and condition effects without changing another slot.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture('firelash'),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 1','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.moveBalanceRule,'source-subset-v1');b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.dex.moves.get('firelash').basePower,90);b.makeChoices('move 1','move 1');assert.equal(b.p2.active[0].boosts.def,-2);assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
