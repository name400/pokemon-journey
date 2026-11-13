import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn,createSoloMultiFoeSnapshot} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
const mon=(id,boxId,move,level=35)=>({...makeMon(id,level),boxId,moves:[move],pp:{}});

test('multi Plus is owned by the player, selects a target, and persists after reload',()=>{
 const player={...mon(1,'player','몸통박치기'),adventurePlusMastered:['tackle']},ally=mon(25,'ally','튀어오르기'),foes=[mon(143,'enemy1','튀어오르기',65),mon(143,'enemy2','튀어오르기',65)];
 const legacy=createMission10DoubleSnapshot([player],[ally],foes),combat={...legacy,adventurePlusGaugeV1:{charge:1,max:3}};
 assert.throws(()=>playMission10MultiTurn(legacy,{type:'move',move:'tackle',target:2,plus:true}));
 assert.throws(()=>playMission10MultiTurn(combat,{type:'move',move:'tackle',target:9,plus:true}));
 const v=mission10MultiView(combat);assert.equal(v.adventurePlusGauge.charge,1);assert.equal(v.requests[0].actors[0].moves[0].plusReady,true);
 const normal=playMission10MultiTurn(combat,{type:'move',move:'tackle',target:2}),plus=playMission10MultiTurn(combat,{type:'move',move:'tackle',target:2,plus:true});
 assert.ok(plus.teams[3][0].hp<normal.teams[3][0].hp);assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.equal(normal.adventurePlusGaugeV1.charge,2);assert.deepEqual(plus.owners,legacy.owners);
 const restored=JSON.parse(JSON.stringify(plus));assert.equal(mission10MultiView(restored).adventurePlusGauge.charge,0);assert.throws(()=>playMission10MultiTurn(restored,{type:'move',move:'tackle',target:2,plus:true}));
 assert.equal(playMission10MultiTurn(restored,{type:'move',move:'tackle',target:1}).adventurePlusGaugeV1.charge,1);
 const solo={...createSoloMultiFoeSnapshot([player],foes),adventurePlusGaugeV1:{charge:1,max:3}};assert.equal(playMission10MultiTurn(solo,{type:'move',move:'tackle',target:1,plus:true}).adventurePlusGaugeV1.charge,0);
});

test('verified starter mastery uses level thresholds without changing saved Pokémon',async()=>{
 const {adventureMoveMastered}=await import('../lib/cloud-adventure/adventure-plus-mastery.mjs');
 for(const [id,move,level] of [[152,'tackle',10],[498,'ember',9],[158,'watergun',9],[153,'gigadrain',19],[160,'crunch',33]]){
  const below={...makeMon(id,level-1),adventurePlusMastered:[]},at={...below,level};const before=JSON.stringify(at);
  assert.equal(adventureMoveMastered(below,move),false);assert.equal(adventureMoveMastered(at,move),true);assert.equal(JSON.stringify(at),before);
 }
 assert.equal(adventureMoveMastered({...makeMon(25,100)},'tackle'),false);
 assert.equal(adventureMoveMastered({...makeMon(25,5),adventurePlusMastered:['tackle']},'tackle'),true);
});
