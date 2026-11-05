import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
function fixture({ability='pressure',ghost=false,modern=true}={}){
 const doc={coins:17,adventure:{safe:true}},state=ensureClassicState(doc);
 const hero=makeReferenceMon(143,50,{boxId:'hero',moves:['Splash'],ability:'runaway'});
 const foe=makeReferenceMon(ghost?94:151,50,{boxId:'foe',moves:['Teleport'],ability});
 const run={id:'wild-teleport',seed:'wild-teleport',wave:21,biome:1,rng:42,screen:'battle',party:[hero],balls:{pokeball:5},money:1000,modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[],rerolls:0,calledMoveRule:'source-pool-v1',...(modern?{wildTeleportRule:'single-source-v1'}:{})};
 state.slots[0]=run;state.slots[1]={keep:true};run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];return {doc,run};
}
test('wild Teleport ends battle without defeating the enemy and can resume after saving',async()=>{
 let {doc}=fixture();doc=await decodeGameData(await encodeGameData(doc));let run=activeClassicRun(doc),xp=run.party[0].experience;
 const result=applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});
 assert.equal(run.combat.wildTeleportEscaped,true);assert.equal(run.screen,'reward');assert.deepEqual(run.rewards,[]);assert.equal(run.party[0].experience,xp);assert.ok(run.combat.teams[1][0].hp>0);assert.equal(result.finishedBattle.actionResult,'escape');assert.throws(()=>applyClassicAction(doc,{action:'reroll'}),/새로고침/);assert.equal(run.money,1000);
 doc=await decodeGameData(await encodeGameData(doc));run=activeClassicRun(doc);applyClassicAction(doc,{action:'skipReward'});assert.equal(run.wave,22);assert.equal(run.screen,'battle');assert.deepEqual(doc.classic.slots[1],{keep:true});assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,17);
});
for(const ghost of [false,true])test(`wild move trapping ${ghost?'is bypassed by Ghost':'prevents escape'}`,()=>{
 const {doc,run}=fixture({ghost}),b=restoreClassicNativeBattle(run.combat,run),p=b.p2.active[0];p.addVolatile('ingrain');run.combat.snapshot=snapshotClassicNativeBattle(b);
 applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});assert.equal(!!run.combat.wildTeleportEscaped,ghost);assert.equal(run.screen,ghost?'reward':'battle');
});
test('old save retains native behavior',()=>{const {doc,run}=fixture({modern:false});applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});assert.equal(run.screen,'battle');assert.ok(!run.combat.wildTeleportEscaped);});
test('Run Away bypasses a trapping move and Fairy Lock',()=>{
 for(const trap of ['ingrain','fairylock']){const {doc,run}=fixture({ability:'runaway'}),b=restoreClassicNativeBattle(run.combat,run);if(trap==='fairylock')b.field.addPseudoWeather('fairylock');else b.p2.active[0].addVolatile('ingrain');run.combat.snapshot=snapshotClassicNativeBattle(b);applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});assert.equal(run.combat.wildTeleportEscaped,true,trap);}
});
test('Fairy Lock prevents a wild escape without bypass',()=>{
 const {doc,run}=fixture(),b=restoreClassicNativeBattle(run.combat,run);b.field.addPseudoWeather('fairylock');run.combat.snapshot=snapshotClassicNativeBattle(b);applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});assert.equal(run.screen,'battle');assert.ok(!run.combat.wildTeleportEscaped);
});
test('opposing Shadow Tag does not prevent the wild move from fleeing',()=>{
 const {doc,run}=fixture();run.party[0].ability='shadowtag';run.combat=createClassicCombat(run,run.combat.teams[1]);run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});assert.equal(run.combat.wildTeleportEscaped,true);
});
test('player Teleport still requests a switch when a reserve exists',()=>{
 const {doc,run}=fixture(),ally=makeReferenceMon(1,50,{boxId:'ally',moves:['Splash']});run.party[0].moves=['Teleport'];run.party.push(ally);run.combat=createClassicCombat(run,[makeReferenceMon(151,50,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'teleport'}});assert.equal(run.screen,'battle');assert.equal(run.combat.requests[0].actors[0].kind,'switch');assert.ok(!run.combat.wildTeleportEscaped);
});
test('wild doubles cannot flee with Teleport',()=>{
 const {doc,run}=fixture(),other=makeReferenceMon(7,50,{boxId:'other',moves:['Splash']}),foe=run.combat.teams[1][0],foe2=makeReferenceMon(25,50,{boxId:'foe2',moves:['Splash']});run.party.push(other);run.combat=createClassicCombat(run,[foe,foe2],{doubles:true});run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]}});assert.equal(run.screen,'battle');assert.ok(!run.combat.wildTeleportEscaped);
});
test('knockout before Teleport awards normal battle victory',()=>{
 const {doc,run}=fixture();run.party[0].moves=['Seismic Toss'];run.combat=createClassicCombat(run,[run.combat.teams[1][0]]);const b=restoreClassicNativeBattle(run.combat,run);b.p2.active[0].hp=1;run.combat.snapshot=snapshotClassicNativeBattle(b);run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});assert.equal(run.combat.ended,true);assert.ok(!run.combat.wildTeleportEscaped);assert.equal(run.screen,'reward');assert.ok(run.rewards.length>0);
});
test('player Teleport with no reserve fails instead of ending the battle',()=>{
 const {doc,run}=fixture();run.party[0].moves=['Teleport'];run.combat=createClassicCombat(run,[makeReferenceMon(151,50,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];applyClassicAction(doc,{action:'turn',command:{type:'move',move:'teleport'}});assert.equal(run.screen,'battle');assert.ok(!run.combat.wildTeleportEscaped);
});
