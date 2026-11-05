import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicMoveFlags} from '../lib/rogue-move-balance.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const mon=(boxId,move='Splash',ability='pressure')=>makeReferenceMon(151,50,{boxId,moves:[move],ability});
function fixture(move,modern=true,ability='pressure',foeAbility='pressure'){
 const r={id:'flags',wave:30,biome:1,rng:1234,screen:'battle',party:[mon('hero',move,ability)],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};if(modern)r.moveFlagRule='source-subset-v1';r.combat=createClassicCombat(r,[mon('foe','Splash',foeAbility)],{trainer:true});return r;
}
for(const [id,flags] of Object.entries(classicMoveFlags)){const before={...Dex.moves.get(id).flags},r=fixture(id),b=restoreClassicNativeBattle(r.combat,r);for(const key of Object.keys(flags))assert.equal(b.dex.moves.get(id).flags[key],1);assert.deepEqual(Dex.moves.get(id).flags,before);}
// Source slicing flags actually enable Sharpness damage for an otherwise identical attack.
for(const move of ['Metal Claw','Crush Claw','Dragon Claw','Shadow Claw','Dual Chop','Dire Claw']){
 const damage=[];for(const modern of [false,true]){const r=fixture(move,modern,'sharpness'),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],original=b.randomChance.bind(b);b.randomChance=(n,d)=>d===100?true:original(n,d);let total=0;b.onEvent('DamagingHit',b.format,{priority:-100},function(amount,target){if(target===foe)total+=amount;});b.makeChoices('move 1','move 1');damage.push(total);}assert.ok(damage[1]>damage[0]*1.35,`${move}: ${damage}`);
}
// Wind Rider blocks these newly classified wind attacks and raises Attack.
for(const move of ['Silver Wind','Ominous Wind'])for(const modern of [false,true]){const r=fixture(move,modern,'pressure','windrider'),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;b.makeChoices('move 1','move 1');assert.equal(foe.hp===before,modern);assert.equal(foe.boosts.atk,modern?1:0);}
// Iron Fist applies to source Double Shock while its Electric-type removal still occurs.
{const damage=[];for(const modern of [false,true]){const r=fixture('Double Shock',modern,'ironfist');r.party[0]=makeReferenceMon(25,50,{boxId:'hero',moves:['Double Shock'],ability:'ironfist'});r.combat=createClassicCombat(r,[mon('foe')],{trainer:true});const b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;b.makeChoices('move 1','move 1');damage.push(before-foe.hp);assert.ok(!b.p1.active[0].hasType('Electric'));}assert.ok(damage[1]>damage[0]*1.15);}
// Source Dragon Cheer is a sound move, so a Soundproof ally blocks its effect.
for(const modern of [false,true]){const r=fixture('Dragon Cheer',modern);r.party.push(mon('ally','Splash','soundproof'));r.combat=createClassicCombat(r,[mon('foe'),mon('foe2')],{trainer:true,doubles:true});const b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 1 -2, move 1','move 1, move 1');assert.equal(!!b.p1.active[1].volatiles.dragoncheer,!modern);}
// Persist the flag rules and ability effects without changing another save slot.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture('Silver Wind',true,'pressure','windrider');r.moveBalanceRule='source-subset-v2';r.combat=createClassicCombat(r,[mon('foe','Splash','windrider')],{trainer:true});let b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 1','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.moveFlagRule,'source-subset-v1');b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.dex.moves.get('firelash').basePower,90);const before=b.p2.active[0].hp;b.makeChoices('move 1','move 1');assert.equal(b.p2.active[0].hp,before);assert.equal(b.p2.active[0].boosts.atk,2);assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
// Razor Wind still charges for a turn before Wind Rider blocks the attack.
{const r=fixture('Razor Wind',true,'pressure','windrider'),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;b.makeChoices('move 1','move 1');assert.equal(foe.boosts.atk,0);b.makeChoices('move 1','move 1');assert.equal(foe.hp,before);assert.equal(foe.boosts.atk,1);}
