import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,classicCombatView,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

function fixture(modern=true,species=151){
 const hero=makeReferenceMon(species,50,{boxId:'hero',moves:['Dark Void','Splash']});
 const foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});foe.ability='pressure';
 const r={id:'void-test',seed:'void-test',rng:1,wave:1,biome:1,screen:'battle',party:[hero],foes:[foe],modifiers:[],balls:{},tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};
 if(modern)r.darkVoidRule='source-subset-v1';r.combat=createClassicCombat(r,r.foes,{trainer:true});return r;
}
// Non-Darkrai can use the move and an accuracy roll between 50 and 80 hits.
for(const [modern,species,shouldSleep] of [[true,151,true],[false,151,false],[true,491,true],[false,491,false]]){
 const r=fixture(modern,species),b=restoreClassicNativeBattle(r.combat,r),original=b.randomChance.bind(b);let checks=0;b.randomChance=(n,d)=>{if(d===100){checks++;return 60<n;}return original(n,d);};
 assert.equal(classicCombatView(r.combat).requests[0].moves.find(m=>m.id==='darkvoid').accuracy,modern?80:50);
 b.makeChoices('move 1','move 1');assert.equal(b.p2.active[0].status==='slp',shouldSleep,`${modern} ${species}`);if(species===491||modern)assert.ok(checks>0);
}
// Save and restore retains the rule, accuracy display, and another slot.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture(),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.darkVoidRule,'source-subset-v1');assert.equal(classicCombatView(r.combat).requests[0].moves.find(m=>m.id==='darkvoid').accuracy,80);b=restoreClassicNativeBattle(r.combat,r);const original=b.randomChance.bind(b);b.randomChance=(n,d)=>d===100?60<n:original(n,d);b.makeChoices('move 1','move 1');assert.equal(b.p2.active[0].status,'slp');assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
