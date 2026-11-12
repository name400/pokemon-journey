import test from 'node:test';
import assert from 'node:assert/strict';
import {moves} from '../lib/game.mjs';
import {mission37Companion} from '../lib/cloud-adventure/adventure-mission37-companions.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {makeMon} from '../lib/game.mjs';

test('mission 37 partners have legal moves and remain separate from the player',()=>{
 for(const [stage,name,stone] of [[2,'Ivor','falinksite'],[3,'Canari','eelektrossite'],[4,'Lebanne','dragalgite'],[5,'Corbeau','scolipite'],[6,'Griselle','pyroarite']]){
  const {name:actual,team}=mission37Companion(stage);assert.equal(actual,name);assert.equal(team[0].item,stone);assert.ok(team.every(m=>m.moves.length===4&&m.moves.every(move=>Object.hasOwn(moves,move))));
  const player={...makeMon(150,100),boxId:'owned',moves:['방어'],pp:{}},foes=[0,1].map(i=>({...makeMon(129,5),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
  const before=structuredClone(player),fight=createMission10DoubleSnapshot([player],team,foes),after=playMission10MultiTurn(fight,{type:'move',move:'protect'});assert.deepEqual(player,before);assert.deepEqual(after.owners.player,['owned']);assert.ok(after.teams[2].every(m=>m.boxId.startsWith(`mission37-ally-${stage}-`)));
 }
 assert.equal(mission37Companion(0),null);assert.equal(mission37Companion('__proto__'),null);
});
