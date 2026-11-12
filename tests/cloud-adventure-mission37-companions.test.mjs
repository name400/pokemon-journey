import test from 'node:test';
import assert from 'node:assert/strict';
import {moves} from '../lib/game.mjs';
import {mission36Partners,mission37Companion} from '../lib/cloud-adventure/adventure-mission37-companions.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {makeMon} from '../lib/game.mjs';
import {Battle} from '@pkmn/sim';

test('mission 37 partners have legal moves and remain separate from the player',()=>{
 for(const [stage,name,stone] of [[2,'Ivor','falinksite'],[3,'Canari','eelektrossite'],[4,'Lebanne','dragalgite'],[5,'Corbeau','scolipite'],[6,'Griselle','pyroarite']]){
  const {name:actual,team}=mission37Companion(stage);assert.equal(actual,name);assert.equal(team[0].item,stone);assert.ok(team.every(m=>m.moves.length===4&&m.moves.every(move=>Object.hasOwn(moves,move))));
  const player={...makeMon(150,100),boxId:'owned',moves:['방어'],pp:{}},foes=[0,1].map(i=>({...makeMon(129,5),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
  const before=structuredClone(player),fight={...createMission10DoubleSnapshot([player],team,foes),adventureCompanionMegaV1:true},after=playMission10MultiTurn(fight,{type:'move',move:'protect'}),sim=Battle.fromJSON(after.snapshot);assert.deepEqual(player,before);assert.deepEqual(after.owners.player,['owned']);assert.ok(after.teams[2].every(m=>m.boxId.startsWith(`mission37-ally-${stage}-`)));assert.equal(sim.p3.active[0].species.isMega,true,name);assert.equal(!!sim.p1.active[0].species.isMega,false);
 }
 assert.equal(mission37Companion(0),null);assert.equal(mission37Companion('__proto__'),null);
});

test('partner mega evolution is opt-in, survives reload, and permits the player to mega evolve',()=>{
 const player={...makeMon(310,60),boxId:'owned',item:'manectite',moves:['방어'],pp:{}},ally=mission37Companion(2).team,foes=[0,1].map(i=>({...makeMon(129,5),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const legacy=createMission10DoubleSnapshot([player],ally,foes),oldNext=playMission10MultiTurn(legacy,{type:'move',move:'protect'});assert.equal(!!Battle.fromJSON(oldNext.snapshot).p3.active[0].species.isMega,false);
 const started={...createMission10DoubleSnapshot([player],ally,foes),adventureCompanionMegaV1:true},saved=JSON.parse(JSON.stringify(started)),after=playMission10MultiTurn(saved,{type:'move',move:'protect',special:'mega'}),sim=Battle.fromJSON(after.snapshot);assert.equal(sim.p1.active[0].species.isMega,true);assert.equal(sim.p3.active[0].species.isMega,true);assert.deepEqual(after.owners.player,['owned']);assert.equal(after.teams[0][0].item,'manectite');assert.equal(after.teams[2][0].item,'falinksite');
 const next=playMission10MultiTurn(JSON.parse(JSON.stringify(after)),{type:'move',move:'protect'});assert.equal(Battle.fromJSON(next.snapshot).p3.active[0].species.isMega,true);
});

test('mission 36 provisional joint side has verified moves, separate ownership, and a mega lead',()=>{
 const team=mission36Partners(),player={...makeMon(150,100),boxId:'owned',moves:['방어'],pp:{}},foes=[0,1].map(i=>({...makeMon(129,5),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
 assert.deepEqual(team.map(m=>[m.speciesId,m.level,m.item]),[[121,59,'starminite'],[560,59,'scraftinite'],[693,58,''],[168,58,''],[584,58,''],[302,58,'']]);assert.ok(team.every(m=>m.moves.every(move=>Object.hasOwn(moves,move))));
 const fight={...createMission10DoubleSnapshot([player],team,foes),adventureCompanionMegaV1:true},after=playMission10MultiTurn(JSON.parse(JSON.stringify(fight)),{type:'move',move:'protect'});assert.equal(Battle.fromJSON(after.snapshot).p3.active[0].species.id,'starmiemega');assert.deepEqual(after.owners.player,['owned']);assert.equal(after.teams[2].length,6);
});
