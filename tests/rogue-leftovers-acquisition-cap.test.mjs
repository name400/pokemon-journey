import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {collectClassicPickup} from '../lib/rogue-pickup.mjs';
import {classicLeftoversCount,classicHeldItemCount} from '../lib/rogue-held-item-cap.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const mon=(boxId,item='')=>makeReferenceMon(151,50,{boxId,moves:['Splash','Thief','Trick','Corrosive Gas'],item});
const restored=async run=>(await decodeGameData(await encodeGameData({run,adventure:{keep:true}}))).run;
function fixture(method,kind,total,id='leftovers'){
 const owner=mon('owner',kind==='modifier'?id:''),foe=mon('foe',kind==='native'?id:'');foe.moves=['Splash'];if(kind==='modifier')foe.rogueFixedModifiers=[{id,count:1,typeBoost:null}];
 const run={id:'leftovers-cap',wave:21,biome:1,rng:42,screen:'battle',party:[owner],modifiers:[{id,boxId:'owner',count:total-Number(kind==='modifier'),typeBoost:null}],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],balls:{}};
 if(method==='grip')run.modifiers.push({id:'gripclaw',boxId:'owner',count:5});if(method==='blackhole')run.modifiers.push({id:'miniblackhole',boxId:'owner',count:1});
 run.combat=createClassicCombat(run,[foe]);return run;
}
function assertBattleOwnership(run,before,kind,received){
 const native=restoreClassicNativeBattle(run.combat,run),owner=native.p1.active[0],foe=native.p2.active[0];
 assert.equal(classicLeftoversCount(run.combat.modifiers,'owner',owner.item),before+Number(received));
 assert.equal(classicLeftoversCount(run.combat.modifiers,'foe',foe.item),Number(!received));
 if(kind==='modifier')assert.equal(owner.item,'leftovers');
}
test('Grip Claw counts native and modifier Leftovers together before removing either representation',async()=>{
 for(const kind of ['native','modifier'])for(const total of [3,4,5]){
  let run=await restored(fixture('grip',kind,total));const battle=restoreClassicNativeBattle(run.combat,run);battle.randomChance=()=>true;
  battle.runEvent('DamagingHit',battle.p2.active[0],battle.p1.active[0],battle.dex.moves.get('tackle'),1);run.combat.snapshot=snapshotClassicNativeBattle(battle);run=await restored(run);assertBattleOwnership(run,total,kind,total===3);
 }
});
test('Mini Black Hole uses the live combined cap and does not delete legacy overflow on restored turns',async()=>{
 for(const kind of ['native','modifier'])for(const total of [3,4,5]){
  let run=await restored(fixture('blackhole',kind,total));run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];run=await restored(run);assertBattleOwnership(run,total,kind,total===3);
 }
});
test('native Thief is blocked before removal at cap, while Corrosive Gas may still destroy the target item',async()=>{
 for(const total of [3,4,5])for(const move of ['thief','corrosivegas']){
  let run=await restored(fixture('none','native',total));run.combat=playClassicCombat(run,{type:'move',move});run.party=run.combat.teams[0];run=await restored(run);
  if(move==='thief')assertBattleOwnership(run,total,'native',total===3);
  else{const battle=restoreClassicNativeBattle(run.combat,run);assert.equal(classicLeftoversCount(run.combat.modifiers,'owner',battle.p1.active[0].item),total);assert.equal(battle.p2.active[0].item,'');}
 }
});
test('Trick preflights both recipients before removing items and permits equal Leftovers exchanges at cap',async()=>{
 for(const reverse of [false,true]){let run=fixture('none','native',4);run.party[0].item=reverse?'leftovers':'oranberry';const foe=mon('foe',reverse?'oranberry':'leftovers');foe.moves=['Splash'];run.modifiers=[{id:'leftovers',boxId:reverse?'foe':'owner',count:4,typeBoost:null}];run.combat=createClassicCombat(run,[foe]);if(reverse){run.combat.modifiers=run.combat.modifiers.filter(row=>row.boxId!=='foe');run.combat.modifiers.push({id:'leftovers',boxId:'foe',count:4,typeBoost:null});}const before=restoreClassicNativeBattle(run.combat,run).sides.map(side=>side.active[0].item);run=await restored(run);run.combat=playClassicCombat(run,{type:'move',move:'trick'});const battle=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(battle.sides.map(side=>side.active[0].item),before);}
 let run=fixture('none','native',3);run.party[0].item='leftovers';const foe=mon('foe','leftovers');foe.moves=['Splash'];run.combat=createClassicCombat(run,[foe]);run.combat=playClassicCombat(run,{type:'move',move:'trick'});const battle=restoreClassicNativeBattle(run.combat,run);assert.equal(classicLeftoversCount(run.combat.modifiers,'owner',battle.p1.active[0].item),4);assert.equal(battle.p2.active[0].item,'leftovers');
});
test('Pickup skips a blocked Leftovers draw without throwing or rerolling and leaves the source copy',async()=>{
 for(const kind of ['native','modifier'])for(const total of [3,4,5]){
  let run=fixture('none',kind,total);run.party[0].ability='pickup';run.combat.snapshot.sides[0].pokemon[0].ability='pickup';run.combat.ended=true;run.combat.winner=0;run.combat.teams[1][0].hp=0;run.combat.snapshot.sides[1].pokemon[0].hp=0;delete run.combat.lootLedger;
  run=await restored(run);let draws=0;const taken=collectClassicPickup(run,()=>{draws++;return 0;});assert.equal(draws,1);assert.equal(taken.length,Number(total===3));assert.equal(classicLeftoversCount(run.modifiers,'owner',run.party[0].item),total+Number(total===3));
  const foe=run.combat.teams[1][0],native=run.combat.snapshot.sides[1].pokemon[0];assert.equal(classicLeftoversCount(run.combat.modifiers,'foe',native.item??foe.item),Number(total!==3));assert.deepEqual(collectClassicPickup(run,()=>{throw Error('must not reroll settled Pickup')}),[]);
 }
});

test('Bestow refuses full receivers before removing the donor native item',async()=>{
 for(const total of [3,4,5]){let run=fixture('none','native',0);run.party[0].item='leftovers';run.party[0].moves=['Bestow'];run.modifiers=[];const foe=mon('foe');foe.moves=['Splash'];foe.rogueFixedModifiers=[{id:'leftovers',count:total,typeBoost:null}];run.combat=createClassicCombat(run,[foe]);run=await restored(run);run.combat=playClassicCombat(run,{type:'move',move:'bestow'});run=await restored(run);const battle=restoreClassicNativeBattle(run.combat,run);assert.equal(battle.p1.active[0].item,total<4?'':'leftovers');assert.equal(classicLeftoversCount(run.combat.modifiers,'foe',battle.p2.active[0].item),total+Number(total<4));}
});
test('Symbiosis preserves the donor item when a restored ally consumes a berry at the Leftovers cap',async()=>{
 for(const total of [3,4,5]){const receiver=mon('owner','sitrusberry'),giver=mon('giver','leftovers');giver.ability='symbiosis';let run={id:'symbiosis-cap',wave:21,biome:1,rng:42,party:[receiver,giver],modifiers:[{id:'leftovers',boxId:'owner',count:total,typeBoost:null}],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[]};run.combat=createClassicCombat(run,[mon('foe'),mon('foe2')],{doubles:true});run=await restored(run);const battle=restoreClassicNativeBattle(run.combat,run),owner=battle.p1.active[0],donor=battle.p1.active[1];owner.hp=Math.floor(owner.maxhp/2);assert.equal(owner.eatItem(),true);assert.equal(owner.item,total<4?'leftovers':'');assert.equal(donor.item,total<4?'':'leftovers');assert.equal(classicLeftoversCount(run.combat.modifiers,'owner',owner.item),total+Number(total<4));run.combat.snapshot=snapshotClassicNativeBattle(battle);const saved=await restored(run),again=restoreClassicNativeBattle(saved.combat,saved);assert.equal(again.p1.active[1].item,donor.item);}
});
test('Covet, Magician and Pickpocket obey the same cap in actual restored battle turns',async()=>{
 for(const method of ['covet','magician','pickpocket'])for(const total of [3,4,5]){
  let run=fixture('none','native',total);run.party[0].moves=[method==='pickpocket'?'Splash':method==='covet'?'Covet':'Tackle'];if(method!=='covet')run.party[0].ability=method;
  const foe=mon('foe','leftovers');foe.moves=[method==='pickpocket'?'Tackle':'Splash'];run.combat=createClassicCombat(run,[foe]);run=await restored(run);run.combat=playClassicCombat(run,{type:'move',move:method==='pickpocket'?'splash':method==='covet'?'covet':'tackle'});run=await restored(run);assertBattleOwnership(run,total,'native',total===3);
 }
});

test('Shell Bell uses the same reviewed native-plus-stack cap in Grip Claw, Black Hole and Pickup',async()=>{
 for(const method of ['grip','blackhole','pickup'])for(const kind of ['native','modifier'])for(const total of [3,4]){
  let run=await restored(fixture(method,kind,total,'shellbell'));
  if(method==='pickup'){run.party[0].ability='pickup';run.combat.snapshot.sides[0].pokemon[0].ability='pickup';run.combat.ended=true;run.combat.winner=0;run.combat.teams[1][0].hp=0;run.combat.snapshot.sides[1].pokemon[0].hp=0;delete run.combat.lootLedger;assert.equal(collectClassicPickup(run,()=>0).length,Number(total===3));assert.equal(classicHeldItemCount('shellbell',run.modifiers,'owner',run.party[0].item),total+Number(total===3));}
  else{if(method==='grip'){const battle=restoreClassicNativeBattle(run.combat,run);battle.randomChance=()=>true;battle.runEvent('DamagingHit',battle.p2.active[0],battle.p1.active[0],battle.dex.moves.get('tackle'),1);run.combat.snapshot=snapshotClassicNativeBattle(battle);}else run.combat=playClassicCombat(run,{type:'move',move:'splash'});run=await restored(run);const battle=restoreClassicNativeBattle(run.combat,run);assert.equal(classicHeldItemCount('shellbell',run.combat.modifiers,'owner',battle.p1.active[0].item),total+Number(total===3));assert.equal(classicHeldItemCount('shellbell',run.combat.modifiers,'foe',battle.p2.active[0].item),Number(total!==3));}
 }
});
