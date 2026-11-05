import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

function fixture(foeId,modern=true){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Salt Cure','Splash']});
 const foe=makeReferenceMon(foeId,100,{boxId:'foe',moves:['Splash']});foe.ability='pressure';
 const r={id:'salt-test',seed:'salt-test',rng:1,wave:1,biome:1,screen:'battle',party:[hero],foes:[foe],modifiers:[],balls:{},tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};
 if(modern)r.saltCureRule='source-subset-v1';r.combat=createClassicCombat(r,r.foes,{trainer:true});return r;
}
// Use Salt Cure normally, then check the residual in the same and restored turns.
for(const [id,waterOrSteel] of [[242,false],[9,true],[208,true]])for(const modern of [true,false]){
 let r=fixture(id,modern),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],afterHit;
 b.onEvent('DamagingHit',b.format,{priority:-100},function(damage,target){if(target===foe)afterHit=target.hp;});
 b.makeChoices('move 1','move 1');assert.ok(foe.volatiles.saltcure);assert.ok(Number.isInteger(afterHit));
 const divisor=modern?(waterOrSteel?8:16):(waterOrSteel?4:8),amount=Math.max(1,Math.floor(foe.baseMaxhp/divisor));assert.equal(afterHit-foe.hp,amount);
 const before=foe.hp;r.combat.snapshot=snapshotClassicNativeBattle(b);r=JSON.parse(JSON.stringify(r));b=restoreClassicNativeBattle(r.combat,r);foe=b.p2.active[0];b.makeChoices('move 2','move 1');assert.equal(before-foe.hp,amount);
}
// Magic Guard still prevents indirect damage.
{const r=fixture(242),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0];foe.setAbility('magicguard');foe.addVolatile('saltcure');const before=foe.hp;b.makeChoices('move 2','move 1');assert.equal(foe.hp,before);}
// Persist an inflicted condition and the rule in the game save without altering another slot.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture(9),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 1','move 1');const before=b.p2.active[0].hp,amount=Math.floor(b.p2.active[0].baseMaxhp/8);r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:8},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.saltCureRule,'source-subset-v1');b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');assert.equal(before-b.p2.active[0].hp,amount);assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
