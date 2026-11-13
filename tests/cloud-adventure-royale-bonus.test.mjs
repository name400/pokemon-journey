import test from 'node:test';
import assert from 'node:assert/strict';
import {royaleBonusPickable,takeRoyaleBonus,recordRoyaleBonus,royaleMedalSettlement,recordRoyaleMedalBattle} from '../lib/cloud-adventure/adventure-royale-bonus.mjs';
import {lumioseRoyaleMap,fieldDialogue,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

const now=20*50000,hit=[{kind:'move',side:0,actorBoxId:'p'},{kind:'effect',targetSide:1,targetBoxId:'e',text:'효과가 굉장했다!'},{kind:'damage',targetSide:1,targetBoxId:'e',actorBoxId:'p',hit:true,amount:10}];
test('bonus card is once per night, preserves walkability and expires at the next night',()=>{
 const s={district:'lumiose-royale',zaRoyaleRank:'Y',x:11,y:14,facing:'left'};assert.equal(royaleBonusPickable(s,now),true);assert.equal(lumioseRoyaleMap(s)[14][10],'!');assert.ok(walkable('!'));assert.equal(fieldDialogue(s).action,'takeRoyaleBonus');assert.equal(takeRoyaleBonus(s,now),true);assert.equal(takeRoyaleBonus(s,now),false);assert.equal(royaleBonusPickable(s,now+4*50000),false);assert.equal(royaleBonusPickable(s,now+1200000),true);
});
test('completed cards award only their current rank and respect each point cap',()=>{
 for(const [rank,cap] of Object.entries({Y:3000,X:4000,W:5000,V:6000,F:32000,E:35000,D:38000,C:41000,B:45000})){
  const key=`zaRoyale${rank}Points`,s={district:'lumiose-royale',zaRoyaleRank:rank,[key]:cap-500,trainer:{title:'Z-A 로열 배틀'}};takeRoyaleBonus(s,now);s.zaRoyaleBonusCard.progress=2;assert.equal(recordRoyaleBonus(s,{events:hit,log:[]},'night',now),true);assert.equal(s[key],cap);assert.equal(s.zaRoyaleBonusCard.completed,true);
 }
});
test('only direct super-effective hits by the player count once per move',()=>{
 const s={district:'lumiose-royale',zaRoyaleRank:'Y',zaRoyaleYPoints:2500,trainer:{title:'Z-A 로열 배틀'}};takeRoyaleBonus(s,now);
 const c={events:[...hit,{...hit[2]},...hit.map(e=>({...e,side:e.side===0?1:e.side,actorBoxId:e.actorBoxId==='p'?'opponent':e.actorBoxId}))],log:[]};assert.equal(recordRoyaleBonus(s,c,'night',now),true);assert.equal(s.zaRoyaleBonusCard.progress,1);assert.equal(s.zaRoyaleYPoints,2500);
 assert.equal(recordRoyaleBonus(s,{events:hit,log:[]},'day',now),false);assert.equal(recordRoyaleBonus({...s,district:'lumiose'},{events:hit,log:[]},'night',now),false);assert.equal(recordRoyaleBonus(s,{events:hit,log:[]},'night',now+1200000),false);
 assert.equal(recordRoyaleBonus(s,{events:[{kind:'move',side:0,actorBoxId:'p'},{kind:'effect',targetSide:1,targetBoxId:'e',text:'효과가 굉장했다!'},{...hit[2],hit:false}],log:[]},'night',now),false);
 assert.equal(recordRoyaleBonus(s,{events:hit,log:[]},'night',now),true);const last={events:hit,log:[]};assert.equal(recordRoyaleBonus(s,last,'night',now),true);assert.equal(s.zaRoyaleBonusCard.completed,true);assert.equal(s.zaRoyaleYPoints,3000);assert.match(last.log[0],/1000/);assert.equal(recordRoyaleBonus(s,{events:hit,log:[]},'night',now),false);
});
test('concurrent cards count only matching hits, pay medals once, and preserve legacy completed cards',()=>{
 const s={district:'lumiose-royale',zaRoyaleRank:'Y',trainer:{title:'Z-A 로열 배틀'},zaRoyaleBonusCard:{night:0,rank:'Y',progress:3,completed:true},zaRoyalePrizeMedals:7};
 assert.equal(takeRoyaleBonus(s,now,'fire'),true);assert.equal(takeRoyaleBonus(s,now,'fire'),false);assert.equal(takeRoyaleBonus(s,now,'water'),true);
 const fire=hit.map(e=>e.kind==='move'?{...e,type:'fire'}:e),water=hit.map(e=>e.kind==='move'?{...e,type:'water'}:e);
 assert.equal(recordRoyaleBonus(s,{events:fire,log:[]},'night',now),true);assert.equal(s.zaRoyaleBonusExtraCards.fire.progress,1);assert.equal(s.zaRoyaleBonusExtraCards.water.progress,0);assert.equal(s.zaRoyalePrizeMedals,7);
 assert.equal(recordRoyaleBonus(s,{events:[...fire,...water,...water],log:[]},'night',now),true);assert.equal(s.zaRoyalePrizeMedals,47);assert.equal(s.zaRoyaleYPoints,400);assert.equal(s.zaRoyaleBonusCard.completed,true);assert.equal(recordRoyaleBonus(s,{events:fire,log:[]},'night',now),false);
 assert.equal(royaleBonusPickable(s,now+1200000,'fire'),true);assert.equal(takeRoyaleBonus(s,now+1200000,'fire'),true);assert.equal(s.zaRoyaleBonusExtraCards.fire.progress,0);assert.equal(s.zaRoyalePrizeMedals,47);
});

test('medal settlement uses nightly wins, gold plush, and preserves old pending balances',()=>{
 for(const [wins,multiple] of [[0,10],[4,10],[5,15],[9,15],[10,20],[19,20],[20,25],[29,25],[30,30]]){
  const s={zaRoyalePrizeMedals:100,zaRoyaleMedalNight:0,zaRoyaleMedalWins:wins,log:[]};assert.equal(royaleMedalSettlement(s,'night',now),0);assert.equal(royaleMedalSettlement(s,'day',now),100*multiple);assert.equal(royaleMedalSettlement(s,'day',now),0);
 }
 const old={zaRoyalePrizeMedals:50,log:[]};assert.equal(royaleMedalSettlement(old,'night',now),0);assert.equal(royaleMedalSettlement(old,'day',now,3),750);
 const later={zaRoyalePrizeMedals:20,zaRoyaleMedalNight:0,zaRoyaleMedalWins:1,log:[]};assert.equal(royaleMedalSettlement(later,'night',now+1200000),200);
 const battle={zaRoyalePrizeMedals:80,zaRoyaleMedalNight:0,zaRoyaleMedalWins:5,combat:{}};assert.equal(royaleMedalSettlement(battle,'day',now),0);delete battle.combat;battle.adventureCatchWindow={revision:1};assert.equal(royaleMedalSettlement(battle,'day',now),0);
});
test('only ended Royale trainer battles count wins or halve medals on defeat',()=>{
 const s={district:'lumiose-royale',zaRoyalePrizeMedals:71},trainer={title:'Z-A 로열 배틀'};
 recordRoyaleMedalBattle(s,{ended:false,winner:0},trainer,now);assert.equal(s.zaRoyaleMedalWins,undefined);
 recordRoyaleMedalBattle(s,{ended:true,winner:0},trainer,now);assert.equal(s.zaRoyaleMedalWins,1);
 recordRoyaleMedalBattle(s,{ended:true,winner:1},trainer,now);assert.equal(s.zaRoyalePrizeMedals,35);
 recordRoyaleMedalBattle(s,{ended:true,winner:1},{title:'야생'},now);assert.equal(s.zaRoyalePrizeMedals,35);
 const empty={district:'lumiose-royale',zaRoyalePrizeMedals:0,zaRoyaleMedalNight:0,zaRoyaleMedalWins:4};recordRoyaleMedalBattle(empty,{ended:true,winner:0},trainer,now+1200000);assert.equal(empty.zaRoyaleMedalNight,1);assert.equal(empty.zaRoyaleMedalWins,1);
});
