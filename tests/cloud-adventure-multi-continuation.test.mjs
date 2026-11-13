import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';

export function longCompanionBattle(){
 const mon=(id,boxId)=>({...makeMon(id,30),boxId,moves:['튀어오르기','축하','고속이동','신비의부적'],pp:{}});
 const player={...mon(25,'player'),hp:1,moves:['몸통박치기']},ally=mon(129,'ally'),foes=[{...mon(597,'foe-1'),ability:'ironbarbs'},mon(129,'foe-2')];
 return createMission10DoubleSnapshot([player],[ally],foes);
}

test('long companion-only battle saves and resumes without replaying the player move',()=>{
 const initial=longCompanionBattle();assert.throws(()=>playMission10MultiTurn(initial,{type:'continue'}));
 let partial=playMission10MultiTurn(initial,{type:'move',move:'tackle',target:1});
 assert.equal(partial.ended,false);assert.equal(partial.adventureMultiContinueV1,true);assert.equal(partial.teams[0][0].hp,0);assert.equal(partial.teams[0][0].moveUsage.tackle,1);
 const before=partial.snapshot.turn;partial=JSON.parse(JSON.stringify(partial));assert.equal(mission10MultiView(partial).adventureMultiContinueV1,true);
 assert.throws(()=>playMission10MultiTurn(partial,{type:'move',move:'tackle',target:1}));
 for(let i=0;i<8&&!partial.ended;i++){assert.equal(partial.adventureMultiContinueV1,true);partial=playMission10MultiTurn(JSON.parse(JSON.stringify(partial)),{type:'continue'});}
 assert.equal(partial.ended,true);assert.ok(partial.snapshot.turn>before);assert.equal(partial.teams[0][0].moveUsage.tackle,1);assert.equal(partial.adventureMultiContinueV1,false);
 assert.throws(()=>playMission10MultiTurn(partial,{type:'continue'}));
});
