import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon,moves} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {mission35TrainerTeam} from '../lib/cloud-adventure/adventure-mission35-trainers.mjs';

test('mission 35 opponents use their documented rosters and Mega Stones',()=>{
 for(const [key,ids,levels,item] of [['emma',[181,303,428,448,687],[57,57,57,57,58],'malamarite'],['griselle',[663,323,142,376,668],[59,59,60,60,61],'pyroarite']]){
  const team=mission35TrainerTeam(key);assert.deepEqual(team.map(p=>p.speciesId),ids);assert.deepEqual(team.map(p=>p.level),levels);assert.deepEqual(team.map(p=>p.item),['','','','',item]);assert.ok(team.every(p=>p.moves.length===4&&p.moves.every(m=>Object.hasOwn(moves,m))));
 }
 assert.throws(()=>mission35TrainerTeam('__proto__'));
});

test('Emma and Griselle can Mega Evolve their aces in the existing battle engine',()=>{
 const own={...makeMon(150,100),boxId:'player',moves:['방어'],pp:{}};
 for(const [key,appearance] of [['emma','malamarmega'],['griselle','pyroarmega']]){
  const ace=mission35TrainerTeam(key).at(-1);const start=createCombat([own],[ace]);const resumed=JSON.parse(JSON.stringify(start));const result=playCpu(resumed,{type:'move',move:'방어'});assert.equal(result.teams[1][0].battleAppearance,appearance);assert.equal(result.teams[1][0].mega,true);assert.equal(ace.item,key==='emma'?'malamarite':'pyroarite');
 }
});
