import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playDuel} from '../lib/party-battle.mjs';
import {RESEARCH_TM_REWARDS,canLearnResearchTm} from '../lib/cloud-adventure/adventure-research.mjs';
import {STORY_TMS,canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';

test('research TM compatibility covers available base species without mixing regional forms',()=>{
 assert.equal(RESEARCH_TM_REWARDS.length,41);
 for(const tm of RESEARCH_TM_REWARDS){assert.ok(tm.learners.length>0,`TM${tm.number}`);assert.equal(new Set(tm.learners).size,tm.learners.length);}
 const state={zaResearchRewards:[4,12,14,26,40]};
 assert.equal(canLearnResearchTm(state,{id:158,speciesId:158,moves:[]},4),true);
 assert.equal(canLearnResearchTm(state,{id:69,speciesId:69,moves:[]},12),true);
 assert.equal(canLearnResearchTm(state,{id:26,speciesId:26,moves:[]},14),false);
 assert.equal(canLearnResearchTm(state,{id:26,speciesId:26,moves:[]},26),false);
 assert.equal(canLearnResearchTm(state,{id:7,speciesId:7,moves:[]},40),true);
 assert.equal(canLearnResearchTm(state,{id:1,speciesId:1,moves:[]},40),false);
 assert.equal(canLearnResearchTm(state,{id:10026,speciesId:26,moves:[]},14),false);
});

test('verified regional forms use their own TM lists and require matching species',()=>{
 const state={zaResearchRewards:[4,9,14,22,26,27,32,40]};
 for(const [id,speciesId,level] of [[10100,26,14],[10108,53,9],[10164,79,26],[10165,80,32],[10172,199,27],[10234,211,27],[10241,705,32],[10242,706,22],[10243,713,40]])assert.equal(canLearnResearchTm(state,{id,speciesId,moves:[]},level),true,`${id}:${level}`);
 assert.equal(canLearnResearchTm(state,{id:26,speciesId:26,moves:[]},14),false);
 assert.equal(canLearnResearchTm(state,{id:10100,speciesId:25,moves:[]},14),false);
 assert.equal(canLearnResearchTm(state,{id:10100,speciesId:26,moves:['사이코쇼크']},14),false);
 assert.equal(canLearnResearchTm({zaResearchRewards:[]},{id:10100,speciesId:26,moves:[]},14),false);
 assert.equal(canLearnResearchTm(state,{id:10107,speciesId:52,moves:[]},4),false);
});

test('field TMs distinguish base and verified regional compatibility',()=>{
 // These field rewards must remain available as the catalog grows.
 for(const number of ['072','092','076','081','090','047','045','025','089','013','056','034','039','005','103','022','041','040','051','066','011','020','100','104'])assert.ok(STORY_TMS.some(tm=>tm.id===`za-tm${number}`),number);
 for(const id of [7,158,656,693])assert.equal(canLearnStoryTm({'za-tm076':1},{id,speciesId:id,moves:[]},'za-tm076'),true);
 for(const id of [1,25,498])assert.equal(canLearnStoryTm({'za-tm076':1},{id,speciesId:id,moves:[]},'za-tm076'),false);
 assert.equal(canLearnStoryTm({'za-tm076':1},{id:10165,speciesId:80,moves:[]},'za-tm076'),true);
 assert.equal(canLearnStoryTm({'za-tm076':1},{id:10100,speciesId:26,moves:[]},'za-tm076'),false);
 assert.ok(STORY_TMS.some(tm=>tm.id==='za-tm090'&&tm.move==='악의파동'));
 for(const id of [15,42,123,127,167,168,212,253,254,359,475,529,530,545,701,709,900])assert.equal(canLearnStoryTm({'za-tm081':1},{id,speciesId:id,moves:[]},'za-tm081'),true);
 for(const id of [1,52,53,214])assert.equal(canLearnStoryTm({'za-tm081':1},{id,speciesId:id,moves:[]},'za-tm081'),false);
 assert.equal(canLearnStoryTm({'za-tm081':1},{id:10161,speciesId:52,moves:[]},'za-tm081'),true);
 assert.equal(canLearnStoryTm({'za-tm081':1},{id:10161,speciesId:53,moves:[]},'za-tm081'),false);
 assert.equal(canLearnStoryTm({'za-tm081':1},{id:10107,speciesId:52,moves:[]},'za-tm081'),false);
 assert.equal(canLearnStoryTm({'za-tm081':1},{id:10161,speciesId:52,moves:['시저크로스']},'za-tm081'),false);
 assert.equal(canLearnStoryTm({'za-tm081':1},{id:10100,speciesId:26,moves:[]},'za-tm081'),false);
 assert.equal(new Set(STORY_TMS.map(tm=>tm.id)).size,STORY_TMS.length);
 const bag={'za-tm013':1,'za-tm034':1,'za-tm066':1};
 for(const [id,speciesId,tm] of [[10100,26,'za-tm066'],[10108,53,'za-tm034'],[10164,79,'za-tm013'],[10165,80,'za-tm013'],[10172,199,'za-tm013'],[10234,211,'za-tm013'],[10241,705,'za-tm013'],[10242,706,'za-tm013'],[10243,713,'za-tm013']])assert.equal(canLearnStoryTm(bag,{id,speciesId,moves:[]},tm),true,`${id}:${tm}`);
 assert.equal(canLearnStoryTm(bag,{id:52,speciesId:52,moves:[]},'za-tm034'),false);
 assert.equal(canLearnStoryTm(bag,{id:10100,speciesId:25,moves:[]},'za-tm066'),false);
 assert.equal(canLearnStoryTm({}, {id:10100,speciesId:26,moves:[]},'za-tm066'),false);
 assert.equal(canLearnStoryTm(bag,{id:10107,speciesId:52,moves:[]},'za-tm013'),false);
 for(const [tm,id] of [['013',7],['056',1],['034',359],['039',25],['005',4],['103',1],['022',16],['051',1],['066',25],['011',66],['020',25],['100',23],['104',4]])assert.equal(canLearnStoryTm({[`za-tm${tm}`]:1},{id,speciesId:id,moves:[]},`za-tm${tm}`),true,`${id}:${tm}`);
});

test('research TMs retain core effects in the existing turn-based simulator',()=>{
 const foe={...makeMon(129,30),boxId:'foe',moves:['튀어오르기']};
 const wall={...makeMon(25,30),boxId:'wall',moves:['빛의장막']};
 let combat=createCombat([wall],[foe]);
 combat=playDuel(combat,[{type:'move',move:'빛의장막'},{type:'move',move:'튀어오르기'}]);
 assert.ok(Battle.fromJSON(combat.snapshot).p1.sideConditions.lightscreen);
 const plant={...makeMon(1,30),boxId:'plant',moves:['기가드레인']};plant.hp=Math.floor(plant.maxHp/2);
 combat=createCombat([plant],[foe]);const before=combat.teams[0][0].hp;
 combat=playDuel(combat,[{type:'move',move:'기가드레인'},{type:'move',move:'튀어오르기'}]);
 assert.ok(combat.teams[0][0].hp>before);assert.ok(combat.teams[1][0].hp<foe.hp);
});

test('late research TMs apply stat boosts and healing restrictions',()=>{
 const caster={...makeMon(63,50),boxId:'caster',moves:['명상','회복봉인']};
 const foe={...makeMon(35,50),boxId:'foe',moves:['튀어오르기']};
 let combat=createCombat([caster],[foe]);
 combat=playDuel(combat,[{type:'move',move:'명상'},{type:'move',move:'튀어오르기'}]);
 let b=Battle.fromJSON(combat.snapshot);assert.equal(b.p1.active[0].boosts.spa,1);assert.equal(b.p1.active[0].boosts.spd,1);
 combat=playDuel(combat,[{type:'move',move:'회복봉인'},{type:'move',move:'튀어오르기'}]);
 b=Battle.fromJSON(combat.snapshot);assert.ok(b.p2.active[0].volatiles.healblock);
});

test('TM 076 uses the existing turn-based Liquidation move',()=>{
 const player={...makeMon(158,30),boxId:'player',moves:['아쿠아브레이크']};
 const foe={...makeMon(95,30),boxId:'foe',moves:['튀어오르기']};
 let combat=createCombat([player],[foe]);
 combat=playDuel(combat,[{type:'move',move:'아쿠아브레이크'},{type:'move',move:'튀어오르기'}]);
 assert.ok(combat.teams[1][0].hp<foe.hp);
});
