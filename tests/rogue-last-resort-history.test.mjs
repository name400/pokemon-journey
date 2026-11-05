import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,continueClassicWild,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
async function reload(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));assert.deepEqual(doc.other,{keep:true});return doc.run;}
function play(run,move){run.combat=playClassicCombat(run,{type:'move',move});run.party=run.combat.teams[0];}
async function setup(modern=true){const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Last Resort','Splash','Growl','Tackle']}),foe=makeReferenceMon(143,100,{boxId:'first',moves:['Splash']});let run={id:'history',seed:'history',rng:42,wave:21,biome:0,screen:'battle',party:[hero],tools:{},modifiers:[],encounter:{kind:'wild'},...(modern?{lastResortHistoryRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe]);play(run,'splash');play(run,'growl');let b=restoreClassicNativeBattle(run.combat,run);b.p2.active[0].hp=1;run.combat.snapshot=snapshotClassicNativeBattle(b);play(run,'tackle');assert.ok(run.combat.ended);run.wave++;return reload(run);}
function next(run){run.combat=continueClassicWild(run,[makeReferenceMon(143,100,{boxId:'next',moves:['Splash']})]);run.party=run.combat.teams[0];return run;}
function used(run){const b=restoreClassicNativeBattle(run.combat,run);return Object.fromEntries(b.p1.active[0].moveSlots.map(m=>[m.id,m.used]));}
test('changing one move preserves the other move history and tracks the new move',async()=>{
 let run=await setup();run.party[0].moves[3]='Protect';run=next(run);run=await reload(run);assert.deepEqual(used(run),{lastresort:false,splash:true,growl:true,protect:false});play(run,'protect');run=await reload(run);assert.equal(used(run).protect,true);const before=restoreClassicNativeBattle(run.combat,run).p2.active[0].hp;play(run,'lastresort');const b=restoreClassicNativeBattle(run.combat,run);assert.ok(b.p2.active[0].hp<before);
});
test('old runs retain their previous reset behavior',async()=>{let run=await setup(false);run.party[0].moves[3]='Protect';run=next(run);assert.deepEqual(used(run),{lastresort:false,splash:false,growl:false,protect:false});});
test('newly relearned moves do not inherit removed move history',async()=>{
 let run=await setup();run.party[0].moves[1]='Protect';run=next(run);assert.equal(used(run).protect,false);run.party[0].moves[1]='Splash';run=await reload(run);assert.equal(used(run).splash,false);assert.equal(used(run).growl,true);assert.equal(used(run).tackle,true);
});
test('new starts enable history preservation without touching another slot',async()=>{const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'last-history',seed:'last-history'});assert.equal(run.lastResortHistoryRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});});
