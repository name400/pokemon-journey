import assert from 'node:assert/strict';
import {toID} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const mon=(id,boxId,level,moves)=>makeReferenceMon(id,level,{boxId,moves});
const berry=(id,boxId,count=1)=>({id,boxId,count,typeBoost:null});
function fixture(move='Bug Bite'){const hero=mon(151,'hero',50,[move,'Splash']),foe=mon(143,'foe',100,['Splash']);hero.hp=Math.floor(hero.maxHp*.2);foe.rogueFixedModifiers=[berry('berrysitrus','ignored')];return {id:'berry-moves',berryMoveRule:'source-v1',seed:'berry-moves',wave:41,biome:1,rng:42,screen:'battle',party:[hero],foes:[foe],modifiers:[],balls:{},tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};}
const attack=r=>{r.combat=createClassicCombat(r,r.foes,{trainer:true});r.combat=playClassicCombat(r,{type:'move',move:toID(r.party[0].moves[0])});return r;};
// The stolen source modifier is consumed once, applies to the attacker, and cannot be harvested.
for(const move of ['Bug Bite','Pluck']){const r=fixture(move),before=r.party[0].hp;attack(r);assert.equal(r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count,0);assert.equal(r.combat.teams[0][0].hp,before+Math.floor(r.party[0].maxHp/4));const p=restoreClassicNativeBattle(r.combat,r).p1.active[0];assert.equal(p.ateBerry,true);assert.equal(p.m.rogueBerryHarvest?.length||0,0);}
// Incinerate removes exactly one berry but does not eat it.
{const r=fixture('Incinerate'),before=r.party[0].hp;attack(r);assert.equal(r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count,0);assert.equal(r.combat.teams[0][0].hp,before);assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].ateBerry,false);}
// Sticky Hold and Protect prevent the removal.
{const r=fixture('Bug Bite');r.foes[0].ability='stickyhold';attack(r);assert.equal(r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count,1);}
{const r=fixture('Incinerate');r.foes[0].moves=['Protect'];attack(r);assert.equal(r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count,1);}
// A native held berry and a separate modifier compete for one removal, never both.
for(const move of ['Bug Bite','Incinerate']){const r=fixture(move);r.foes[0].item='lumberry';attack(r);const native=r.combat.teams[1][0].item==='lumberry',extra=r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count===1;assert.notEqual(native,extra);}
// Stolen berries trigger Cud Chew on the next phase but do not enter Harvest's recovery memory.
{const r=fixture('Bug Bite');r.party[0].ability='cudchew';attack(r);const first=r.combat.teams[0][0].hp;r.party=r.combat.teams[0];const saved=JSON.parse(JSON.stringify(r));saved.combat=playClassicCombat(saved,{type:'move',move:'splash'});assert.equal(saved.combat.teams[0][0].hp,first+Math.floor(saved.party[0].maxHp/4));const p=restoreClassicNativeBattle(saved.combat,saved).p1.active[0];assert.equal(p.m.rogueBerryHarvest?.length||0,0);}
// The pinned source marks Recycle unimplemented: virtual berry consumption must not fabricate a native item.
{const r=fixture('Recycle');r.foes[0].rogueFixedModifiers=[];r.modifiers=[berry('berrysitrus','hero')];attack(r);assert.equal(r.modifiers.length,0);r.party=r.combat.teams[0];r.combat=playClassicCombat(r,{type:'move',move:'recycle'});assert.equal(r.modifiers.length,0);assert.equal(r.combat.teams[0][0].item,'');}
console.log('Berry moves: steal, burn, protect, Sticky Hold, coexistence, Cud Chew, restore and Recycle passed');
// Opponent theft consumes the player's modifier even when Berry Pouch is present.
{const r=fixture('Splash');r.party[0].hp=r.party[0].maxHp;r.foes[0].moves=['Bug Bite'];r.foes[0].rogueFixedModifiers=[];r.modifiers=[berry('berrylum','hero'),berry('berrypouch',null,3)];attack(r);assert.equal(r.modifiers.some(m=>m.id==='berrylum'),false);assert.equal(r.modifiers.find(m=>m.id==='berrypouch').count,3);const p=restoreClassicNativeBattle(r.combat,r).p2.active[0];assert.equal(p.ateBerry,true);}
// A substitute absorbs the attack without giving up a virtual held berry.
{const r=fixture('Bug Bite');r.combat=createClassicCombat(r,r.foes,{trainer:true});const b=restoreClassicNativeBattle(r.combat,r);b.p2.active[0].addVolatile('substitute',b.p2.active[0],b.dex.moves.get('substitute'));r.combat.snapshot=(await import('../lib/rogue-battle-engine.mjs')).snapshotClassicNativeBattle(b);r.combat=playClassicCombat(r,{type:'move',move:'bugbite'});assert.equal(r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count,1);}
// Mold Breaker can bypass Sticky Hold for a source-style held-berry steal.
{const r=fixture('Bug Bite');r.party[0].ability='moldbreaker';r.foes[0].ability='stickyhold';attack(r);assert.equal(r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count,0);}
// Effects from a stolen berry apply even when the eater does not meet its normal end-turn trigger.
{const r=fixture('Bug Bite');r.party[0].hp=r.party[0].maxHp;r.foes[0].rogueFixedModifiers=[berry('berryliechi','ignored')];attack(r);assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].boosts.atk,1);}
{const r=fixture('Pluck');r.party[0].moves.push('Tackle');r.party[0].pp={tackle:0};r.foes[0].rogueFixedModifiers=[berry('berryleppa','ignored')];attack(r);assert.equal(r.combat.teams[0][0].pp.tackle,10);}
// Incinerate respects the source modifier's nontransferable flag.
{const r=fixture('Incinerate');r.foes[0].rogueFixedModifiers=[{...berry('berrylum','ignored'),transferable:false}];attack(r);assert.equal(r.combat.modifiers.find(m=>m.id==='berrylum'&&m.boxId==='foe').count,1);}
// Incinerate independently removes one virtual berry from each target in doubles.
{const r=fixture('Incinerate');r.party.push(mon(4,'ally',50,['Splash']));const second=mon(143,'foe2',100,['Splash']);second.rogueFixedModifiers=[berry('berrylum','ignored')];r.foes.push(second);r.combat=createClassicCombat(r,r.foes,{trainer:true,doubles:true});r.combat=playClassicCombat(r,{type:'turn',actions:[{actor:0,type:'move',move:'incinerate'},{actor:1,type:'move',move:'splash'}]});assert.equal(r.combat.modifiers.find(m=>m.boxId==='foe'&&m.id==='berrysitrus').count,0);assert.equal(r.combat.modifiers.find(m=>m.boxId==='foe2'&&m.id==='berrylum').count,0);}
// Existing native-item handling is retained when there is no source-style held berry.
{const r=fixture('Bug Bite');r.foes[0].rogueFixedModifiers=[];r.foes[0].item='lumberry';attack(r);assert.equal(r.combat.teams[1][0].item,'');}
// Source Unnerve blocks self-consumption, but not the steal-and-eat effect of Bug Bite.
{const r=fixture('Bug Bite');r.foes[0].ability='unnerve';const before=r.party[0].hp;attack(r);assert.equal(r.combat.modifiers.find(m=>m.id==='berrysitrus'&&m.boxId==='foe').count,0);assert.equal(r.combat.teams[0][0].hp,before+Math.floor(r.party[0].maxHp/4));}
// Legacy runs keep their earlier move behavior and do not choose among virtual berries.
{const r=fixture('Bug Bite');delete r.berryMoveRule;r.foes[0].rogueFixedModifiers=[berry('berrysitrus','ignored'),berry('berrylum','ignored')];const before=r.party[0].hp;attack(r);assert.equal(r.combat.modifiers.filter(m=>m.boxId==='foe'&&m.count===1).length,2);assert.equal(r.combat.teams[0][0].hp,before);}
// Passive Sticky Hold and passive Cud Chew work across the interception and restore boundary.
{const r=fixture('Bug Bite');r.foes[0].roguePassiveAbility='stickyhold';attack(r);assert.equal(r.combat.modifiers.find(m=>m.boxId==='foe'&&m.id==='berrysitrus').count,1);}
{const r=fixture('Bug Bite');r.party[0].roguePassiveAbility='cudchew';attack(r);const first=r.combat.teams[0][0].hp;r.party=r.combat.teams[0];const saved=JSON.parse(JSON.stringify(r));saved.combat=playClassicCombat(saved,{type:'move',move:'splash'});assert.equal(saved.combat.teams[0][0].hp,first+Math.floor(saved.party[0].maxHp/4));}
