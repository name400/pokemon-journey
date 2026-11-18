import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {classicRelearnMoves,classicServices,restoreClassicParty} from '../lib/rogue-classic-services.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(){
 const doc={coins:321,adventure:{untouched:true}},state=ensureClassicState(doc),mon=makeReferenceMon(1,30,{boxId:'learner',moves:['Tackle','Growl','Protect','Vine Whip']}),other=makeReferenceMon(25,10,{boxId:'other',moves:['Splash']});
 mon.rogueMoveHistory=['몸통박치기','성장'];mon.pp={tackle:1,growl:3,protect:2,vinewhip:4};mon.roguePPUps={tackle:2};
 const reward={...CLASSIC_REWARD_REGISTRY.find(d=>d.id==='memorymushroom'),rewardId:'memory-test'};
 const run={id:'memory-alias',seed:'memory-alias',rng:42,wave:81,biome:1,screen:'reward',party:[mon,other],modifiers:[],tools:{},encounter:{kind:'wild'},money:50000,rewards:[reward],rerolls:0};state.slots[0]=run;return {doc,state,run,mon,other};
}
test('memory candidates exclude a known native move alias without mutating the party',()=>{
 const {run,mon}=fixture(),before=structuredClone(run),names=classicRelearnMoves(mon);assert.ok(!names.includes('몸통박치기'));assert.ok(names.includes('성장'));assert.deepEqual(run,before);
 const target=classicRewardView(run,null)[0].targets.find(t=>t.boxId==='learner');assert.ok(!target.learnableMoves.includes('몸통박치기'));assert.ok(target.learnableMoves.includes('성장'));
 const shop=classicServices(run).find(v=>v.id==='memorymushroom');assert.ok(shop);assert.ok(!shop.targets.find(t=>t.boxId==='learner').learnableMoves.includes('몸통박치기'));
});
test('reward rejects the duplicate alias and preserves PP, inventory and other save slots through codec',async()=>{
 let {doc,run}=fixture();const before=structuredClone(doc);assert.throws(()=>applyClassicAction(doc,{action:'reward',rewardId:'memory-test',boxId:'learner',moveName:'몸통박치기',replaceIndex:1}));delete run.updatedAt;assert.deepEqual(doc,before);
 doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];assert.equal(run.party[0].pp.tackle,1);assert.equal(run.party[0].roguePPUps.tackle,2);assert.deepEqual(run.party[0].moves,['Tackle','Growl','Protect','Vine Whip']);assert.equal(doc.coins,321);assert.deepEqual(doc.adventure,{untouched:true});
 assert.throws(()=>restoreClassicParty(run.party,'memorymushroom',{boxId:'learner',moveName:'몸통박치기',replaceIndex:1,run}));assert.equal(run.party[0].pp.tackle,1);
});
test('memory still learns a different move and preserves unrelated PP and data',()=>{
 const {run,mon,other}=fixture(),before=structuredClone(other),next=restoreClassicParty(run.party,'memorymushroom',{boxId:'learner',moveName:'성장',replaceIndex:1,run});assert.deepEqual(next[0].moves,['Tackle','성장','Protect','Vine Whip']);assert.equal(next[0].pp.tackle,1);assert.equal(next[0].roguePPUps.tackle,2);assert.deepEqual(next[1],before);assert.equal(mon.moves[1],'Growl');
});
test('randomized and Sketch move histories retain their existing separate slot semantics',()=>{
 for(const marker of [{rogueMovesetSeed:'seed'},{rogueMovesetRandomizer:true},{rogueSketchRule:'source-v1',rogueSketchPP:[1,3,2,4]},{rogueTrainerSketch:'source-v1'}]){const {mon}=fixture();Object.assign(mon,marker);assert.ok(classicRelearnMoves(mon).includes('몸통박치기'),JSON.stringify(marker));}
});

test('TM rejects a known move alias without changing PP or consuming the reward',()=>{
 const {run,mon}=fixture();run.wave=22;mon.level=10;mon.pp.protect=1;const tm={...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='tm0'),rewardId:'duplicate-tm',moveName:'방어'};run.rewards=[tm];const before=structuredClone(run),target=classicRewardView(run,null)[0].targets.find(t=>t.boxId==='learner');assert.equal(target.eligible,false);assert.throws(()=>applyClassicAction(({classic:{schema:3,sourceVersion:'1.12.2.3',activeSlot:0,slots:[run,null,null,null],system:{},selection:null,history:[]}}),{action:'reward',rewardId:'duplicate-tm',boxId:'learner',replaceIndex:1}));delete run.updatedAt;assert.deepEqual(run,before);assert.equal(mon.pp.protect,1);
});

test('an ordinary compatible TM still teaches a different move without resetting known PP',()=>{
 const {run,mon}=fixture();run.wave=22;mon.level=10;const tm={...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='tm0'),rewardId:'valid-tm',moveName:'빛의장막'};run.rewards=[tm];assert.equal(classicRewardView(run,null)[0].targets.find(t=>t.boxId==='learner').eligible,true);chooseClassicReward(run,{rewardId:'valid-tm',boxId:'learner',replaceIndex:1},null);assert.deepEqual(mon.moves,['Tackle','빛의장막','Protect','Vine Whip']);assert.equal(mon.pp.tackle,1);assert.equal(mon.roguePPUps.tackle,2);
});
