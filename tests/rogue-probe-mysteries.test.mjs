import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {classicTrashBoss,classicDancingLessonsEnemy} from '../lib/rogue-classic-world.mjs';
import {classicSalesmanOffer} from '../lib/rogue-pokemon-salesman.mjs';
import {chooseClassicProbeAction} from '../scripts/classic-probe-policy.mjs';
for(const type of ['training-session','trash-to-treasure','dancing-lessons','bug-superfan','pokemon-salesman','safari-zone','dark-deal','winstrate']){
 const doc={coins:42,collection:[],adventure:{untouched:true}},state=ensureClassicState(doc);
 const party=[makeReferenceMon(151,100,{boxId:'hero',moves:['Ice Beam']}),makeReferenceMon(10,40,{boxId:'bug',moves:['Tackle']}),makeReferenceMon(7,40,{boxId:'ally',moves:['Tackle']})];
 const run={id:'probe-'+type,seed:'probe-'+type,wave:101,biome:4,rng:42,screen:'mystery',party,balls:{pokeball:5},money:100000,modifiers:[],tools:{},encounter:{kind:'mystery',key:type},mystery:{type,stage:'choose'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[],rerolls:0,mysteryState:{spawnWeight:3,history:[]}};
 if(type==='trash-to-treasure')run.mystery.enemy=classicTrashBoss(run);
 if(type==='dancing-lessons')run.mystery.enemy=classicDancingLessonsEnemy(run);
 if(type==='pokemon-salesman')run.mystery.offer=classicSalesmanOffer(run);
 state.slots[0]=run;
 const action=chooseClassicProbeAction(doc);assert.equal(action.action,'mysterySelect',type);applyClassicAction(doc,action);assert.equal(run.mystery.stage,'confirm',type);
 const saved=JSON.parse(JSON.stringify(doc));assert.deepEqual(chooseClassicProbeAction(saved),{action:'mysteryConfirm'},type);applyClassicAction(saved,{action:'mysteryConfirm'});assert.notEqual(saved.classic.slots[0].screen,'mystery',type);const next=chooseClassicProbeAction(saved);assert.ok(next.action,type);applyClassicAction(saved,next);assert.deepEqual(saved.adventure,{untouched:true});
}
console.log('Natural-play probe handles eight additional mystery choices and saved confirmation');
