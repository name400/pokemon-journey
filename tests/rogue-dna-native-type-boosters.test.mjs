import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {CLASSIC_NATIVE_TYPE_BOOSTERS} from '../lib/rogue-dna-native-items.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {fixture as persistentFixture} from './fixtures/dna-persistent.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,classicModifierInventory} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const items=Object.keys(CLASSIC_NATIVE_TYPE_BOOSTERS);
function fixture(primaryItem='charcoal',donorItem='charcoal'){
 const f=persistentFixture([makeReferenceMon(151,50,{boxId:'primary',moves:['Flamethrower','Splash'],item:primaryItem}),makeReferenceMon(7,50,{boxId:'donor',moves:['Splash'],item:donorItem})]);f.run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(row=>row.id==='dnasplicers'),rewardId:'type-items'}];return f;
}
const fuse=run=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor',random:()=>0}).run;
const held=(run,type)=>run.modifiers.filter(row=>row.id==='typebooster'&&row.typeBoost===type&&row.boxId==='primary').reduce((n,row)=>n+row.count,0);
test('all 18 source type-item counterparts preserve all 324 native pairs without native multiplication',()=>{
 assert.equal(items.length,18);assert.equal(new Set(Object.values(CLASSIC_NATIVE_TYPE_BOOSTERS)).size,18);
 for(const primaryItem of items)for(const donorItem of items){const {run}=fixture(primaryItem,donorItem),before=structuredClone(run),next=fuse(run),a=CLASSIC_NATIVE_TYPE_BOOSTERS[primaryItem],b=CLASSIC_NATIVE_TYPE_BOOSTERS[donorItem];assert.deepEqual(run,before);assert.equal(next.party[0].item,'');assert.equal(held(next,a),a===b?2:1);assert.equal(held(next,b),a===b?2:1);assert.equal(next.modifiers.reduce((n,row)=>n+row.count,0),2);assert.deepEqual(next.party[0].rogueFusion.donor,before.party[1]);assert.ok(!next.modifiers.some(row=>row.boxId==='donor'));}
});
test('real DNA rewards, inventory, codec and unsplice retain 18 matching and 18 mixed pairs',async()=>{
 for(let i=0;i<items.length;i++)for(const offset of[0,1]){let {doc,run}=fixture(items[i],items[(i+offset)%items.length]);assert.ok(classicRewardView(run)[0].fusionPairs.some(pair=>pair.primaryBoxId==='primary'&&pair.donorBoxId==='donor'));applyClassicAction(doc,{action:'reward',rewardId:'type-items',boxId:'primary',donorBoxId:'donor',confirmFusion:true});doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.equal(run.party[0].item,'');assert.equal(classicModifierInventory(run).reduce((n,row)=>n+row.count,0),2);run.screen='interlude';run.pendingMoves=[];run.pendingGrowth=[];delete run.combat;applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.equal(run.party[0].fusionSpecies,undefined);assert.equal(run.party[0].item,'');assert.equal(run.modifiers.reduce((n,row)=>n+row.count,0),2);assert.deepEqual(doc.classic.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);}
});
function power(run,type='Fire') {const combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]),battle=restoreClassicNativeBattle(combat,run),move={...Dex.moves.get('flamethrower'),type,basePower:100};return {value:battle.runEvent('BasePower',battle.p1.active[0],battle.p2.active[0],move,100),battle,combat};}
test('normalized type effects use 1+.2*n rather than 1.2 times the modifier and survive real restored turns',async()=>{
 for(const item of items){const next=fuse(fixture(item,item).run),type=CLASSIC_NATIVE_TYPE_BOOSTERS[item];assert.equal(power(next,type).value,140);const legacy=structuredClone(next);legacy.party[0].item=item;legacy.modifiers[0].count=1;assert.equal(power(legacy,type).value,144);const mixed=fixture(item,'magnet').run;mixed.modifiers.push({id:'typebooster',boxId:'primary',typeBoost:type,count:2});const normalized=fuse(mixed);assert.equal(power(normalized,type).value,type==='Electric'?180:160);}
 let run=fuse(fixture().run);run.combat=power(run).combat;for(let i=0;i<2;i++){run=(await decodeGameData(await encodeGameData({run}))).run;const control=structuredClone(run);control.party[0].item='';control.modifiers=[{id:'typebooster',boxId:'primary',typeBoost:'Fire',count:2}];run.combat=playClassicCombat(run,{type:'move',move:'flamethrower'});control.combat=playClassicCombat(control,{type:'move',move:'flamethrower'});assert.deepEqual(run.combat.teams[1].map(p=>p.hp),control.combat.teams[1].map(p=>p.hp));run.party=run.combat.teams[0];assert.equal(held(run,'Fire'),2);assert.equal(run.party[0].item,'');}
 let legacyRun=fixture().run;legacyRun.modifiers=[{id:'typebooster',boxId:'primary',typeBoost:'Fire',count:1}];assert.equal(power(legacyRun).value,144);legacyRun=(await decodeGameData(await encodeGameData({run:legacyRun}))).run;assert.equal(legacyRun.party[0].item,'charcoal');assert.equal(power(legacyRun).value,144);
 const blocked=power(fuse(fixture().run)),p=blocked.battle.p1.active[0];blocked.battle.field.addPseudoWeather('magicroom',p,Dex.moves.get('magicroom'));assert.equal(blocked.battle.runEvent('BasePower',p,blocked.battle.p2.active[0],{...Dex.moves.get('flamethrower'),basePower:100},100),100);
});
test('source cap and ambiguous metadata reject atomically while old overfull saves remain intact',async()=>{
 for(const mutate of [run=>run.modifiers.push({id:'typebooster',boxId:'primary',typeBoost:'Fire',count:98}),run=>run.modifiers.push({id:'typebooster',boxId:'donor',typeBoost:'Fire',count:0}),run=>run.modifiers.push({id:'typebooster',boxId:'primary',typeBoost:'Fire',count:1,active:false}),run=>{run.party[0].rogueNativeItemNontransferable=true;},run=>{run.party[1].rogueNativeItemNontransferable=true;}]){const {run}=fixture();mutate(run);const before=structuredClone(run);assert.throws(()=>fuse(run));assert.deepEqual(run,before);}
 const capped=fixture().run;capped.modifiers=[{id:'typebooster',boxId:'primary',typeBoost:'Fire',count:96},{id:'typebooster',boxId:'donor',typeBoost:'Fire',count:1}];assert.equal(held(fuse(capped),'Fire'),99);
 let {doc,run}=fixture();run.modifiers=[{id:'typebooster',boxId:'primary',typeBoost:'Fire',count:100}];const before=structuredClone(run);doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);assert.deepEqual(run,before);assert.throws(()=>fuse(run));assert.deepEqual(run,before);
});
test('one reviewed type item frees its slot while unrelated native items retain their own effects',()=>{
 for(const item of ['leftovers','shellbell','lifeorb'])for(const reverse of[false,true]){const {run}=fixture(...(reverse?[item,'charcoal']:['charcoal',item])),before=structuredClone(run),next=fuse(run);assert.equal(next.party[0].item,item);assert.equal(held(next,'Fire'),1);assert.deepEqual(next.party[0].rogueFusion.donor,before.party[1]);}
 const plate=fuse(fixture('flameplate','charcoal').run);assert.equal(plate.party[0].item,'flameplate');assert.equal(held(plate,'Fire'),1);
 for(const pair of[['lifeorb','lifeorb'],['flameplate','flameplate'],['charcoal','flameplate']]){const {run}=fixture(...pair),before=structuredClone(run);assert.throws(()=>fuse(run));assert.deepEqual(run,before);}
});
