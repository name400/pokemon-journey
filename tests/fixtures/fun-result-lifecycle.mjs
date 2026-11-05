import {ensureClassicState} from '../../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {applyClassicAction,activeClassicRun} from '../../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../../lib/game-storage.mjs';
export async function resolvedFunFixture(outcome='none'){
 let doc={coins:99,adventure:{safe:true}};const state=ensureClassicState(doc),run={id:'fun-result-lifecycle',seed:'fun',rng:42,wave:22,biome:4,screen:'mystery',mysteryRule:'part-timer-v17',party:[makeReferenceMon(151,100,{boxId:'hero',moves:['Splash','Seismic Toss']})],modifiers:[],tools:{},balls:{},money:100000,encounter:{kind:'mystery',key:'fun-and-games'},mystery:{type:'fun-and-games',stage:'choose'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[]};state.slots[0]=run;state.slots[1]={id:'other',untouched:true};
 applyClassicAction(doc,{action:'mysterySelect',job:'play',boxId:'hero'});applyClassicAction(doc,{action:'mysteryConfirm'});
 if(outcome!=='none'){const hp=outcome==='knockout'?1:Math.floor(run.combat.teams[1][0].maxHp*.25);run.combat.teams[1][0].hp=hp;run.combat.snapshot.sides[1].pokemon[0].hp=hp;}
 for(let i=0;i<(outcome==='knockout'?1:3);i++){doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'turn',command:{type:'move',move:outcome==='knockout'?'seismictoss':'splash'}});}
 return doc;
}
export function leaveFunResult(doc){const run=activeClassicRun(doc);if(run.rewards.length)applyClassicAction(doc,{action:'reward',rewardId:run.rewards[0].rewardId,boxId:'hero'});else applyClassicAction(doc,{action:'skipReward'});return activeClassicRun(doc);}
