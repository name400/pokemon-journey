import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {starterDexEntry} from '../lib/rogue-starter-system.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,playClassicCombat,captureClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('fainted uncaught opponent does not hide capture for a remaining eligible opponent',async()=>{
 const doc={coins:11,collection:[],adventure:{safe:true}},state=ensureClassicState(doc),mon=(id,boxId,level,moves)=>makeReferenceMon(id,level,{boxId,moves});
 const run={id:'end-fainted',seed:'end-fainted',rng:42,wave:180,biome:50,screen:'battle',party:[mon(151,'hero',50,['Seismic Toss']),mon(7,'ally',20,['Splash'])],modifiers:[],tools:{},balls:{masterball:1},encounter:{kind:'wild',trainer:null},initialSwitchSlots:[],pendingMoves:[],pendingGrowth:[]};state.slots[0]=run;state.slots[1]={keep:true};starterDexEntry(state.system,16).caught=true;
 const first=mon(19,'uncaught',1,['Splash']),second=mon(16,'caught',100,['Splash']);first.hp=1;run.combat=createClassicCombat(run,[first,second],{doubles:true});run.combat=playClassicCombat(run,{type:'turn',actions:[{actor:0,type:'move',move:'seismictoss',target:1},{actor:1,type:'move',move:'splash'}]});run.party=run.combat.teams[0];
 assert.equal(run.combat.teams[1][0].hp,0);assert.ok(run.combat.teams[1][1].hp>0);assert.ok(run.combat.activeBySide[1].includes(0));
 const restored=await decodeGameData(await encodeGameData(doc)),saved=ensureClassicState(restored).slots[0],view=classicGameView(restored);assert.equal(view.run.captureAllowed,true);assert.equal(view.run.captureUnavailableReason,'');const capture=captureClassicCombat(saved,'masterball',{system:ensureClassicState(restored).system,targetBoxId:'caught',rng:()=>0});assert.equal(capture.caught.rogueSourceId,16);assert.equal(saved.balls.masterball,0);assert.deepEqual(restored.adventure,{safe:true});assert.deepEqual(ensureClassicState(restored).slots[1],{keep:true});
});

test('a living uncaught opponent still blocks capture without consuming a ball',()=>{
 const doc={coins:4,adventure:{safe:true}},state=ensureClassicState(doc),mon=(id,boxId)=>makeReferenceMon(id,30,{boxId,moves:['Splash']}),run={id:'end-living',seed:'end-living',rng:42,wave:180,biome:50,screen:'battle',party:[mon(1,'hero'),mon(7,'ally')],modifiers:[],tools:{},balls:{masterball:1},encounter:{kind:'wild',trainer:null},initialSwitchSlots:[],pendingMoves:[],pendingGrowth:[]};state.slots[0]=run;starterDexEntry(state.system,16).caught=true;run.combat=createClassicCombat(run,[mon(19,'uncaught'),mon(16,'caught')],{doubles:true});const before=structuredClone(run);assert.equal(classicGameView(doc).run.captureAllowed,false);assert.throws(()=>captureClassicCombat(run,'masterball',{system:state.system,targetBoxId:'caught'}),/엔드 지역/);assert.deepEqual(run,before);assert.deepEqual(doc.adventure,{safe:true});
});
