import test from 'node:test';import assert from 'node:assert/strict';
import {CITY_RANKS,arenaProgress,arenaTrainer,awardArenaWin} from '../lib/adventure-arena.mjs';
import {trainerTeam} from '../lib/campaign.mjs';
import {createCombat} from '../lib/party-battle.mjs';
import {makeMon} from '../lib/game.mjs';
import {existsSync} from 'node:fs';
import {cityIncident,incidentGoal} from '../lib/adventure-incident.mjs';

test('every Z–A rank has valid point and promotion opponents, and wins cannot skip a rank',()=>{
 assert.equal(CITY_RANKS.join(''),'ZYXWVUTSRQPONMLKJIHGFEDCBA');
 const world={};
 for(let rank=0;rank<25;rank++){
  assert.equal(arenaProgress(world).rank,rank);
  let firstOpponent;
  for(let points=0;points<2;points++){
   const trainer=arenaTrainer(world),team=trainerTeam(trainer);
   if(points===0)firstOpponent=trainer;else{assert.notEqual(trainer.name,firstOpponent.name);assert.notDeepEqual(trainer.team,firstOpponent.team);}
   assert.equal(trainer.id,'pc-city-points');assert.ok(team.every(m=>m.level<=100));assert.ok(existsSync(new URL('../public'+trainer.sprite,import.meta.url)));
   assert.ok(createCombat([{...makeMon(150,100),boxId:'player'}],team).requests[0].moves.length);
   assert.equal(awardArenaWin(world,'pc-city-promotion'),false);assert.equal(awardArenaWin(world,trainer.id),true);
  }
  const trainer=arenaTrainer(world),team=trainerTeam(trainer);assert.equal(trainer.id,'pc-city-promotion');assert.ok(team.every(m=>m.level<=100));assert.ok(existsSync(new URL('../public'+trainer.sprite,import.meta.url)));
  assert.ok(createCombat([{...makeMon(150,100),boxId:'player'}],team).requests[0].moves.length);
  assert.equal(awardArenaWin(world,'pc-city-points'),false);assert.equal(awardArenaWin(world,trainer.id),true);
 }
 assert.deepEqual(world.pcCityArena,{rank:25,points:0,wins:75});assert.equal(arenaProgress(world).complete,true);assert.equal(arenaTrainer(world),null);assert.equal(awardArenaWin(world,'pc-city-points'),false);
});
test('new incidents unlock in order and do not expose later megas before the required rank',()=>{
 assert.equal(cityIncident({pcCityArena:{rank:1},pcCityIncident:0}),null);
 assert.equal(cityIncident({pcCityArena:{rank:2},pcCityIncident:0}).species,10033);
 assert.equal(cityIncident({pcCityArena:{rank:2},pcCityIncident:3}),null);
 assert.equal(cityIncident({pcCityArena:{rank:3},pcCityIncident:3}).species,10035);
 assert.equal(cityIncident({pcCityArena:{rank:3},pcCityIncident:6}),null);
 assert.equal(cityIncident({pcCityArena:{rank:4},pcCityIncident:6}).species,10036);
 assert.equal(cityIncident({pcCityArena:{rank:25},pcCityIncident:9}),null);
 assert.match(incidentGoal({pcCityArena:{rank:4},pcCityIncident:7}),/메가거북왕/);
});
