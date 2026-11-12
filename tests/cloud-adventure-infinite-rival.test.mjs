import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon,moves} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {infiniteRivalBattleTeam,infiniteRewardTeam} from '../lib/cloud-adventure/adventure-infinite-royale.mjs';

test('fixed fifteenth rival reward match keeps correct starter teams and Mega Floette',()=>{
 for(const [starter,first,second] of [['grass',160,500],['fire',154,160],['water',500,154]]){
  const state={zaMission10Starter:starter,zaInfiniteRewardWins:14,zaInfiniteSecondWon:true},team=infiniteRivalBattleTeam(state);
  assert.deepEqual(team.map(p=>p.id),[678,706,first,310,second,10061]);assert.deepEqual(team.map(p=>p.level),[70,70,71,71,71,72]);assert.deepEqual(team.map(p=>p.item),['','','','','','floettite']);assert.ok(team.every(p=>p.moves.every(m=>Object.hasOwn(moves,m))));
  const own={...makeMon(150,100),boxId:'own',moves:['방어'],pp:{}};const result=playCpu(JSON.parse(JSON.stringify(createCombat([own],[team[5]]))),{type:'move',move:'방어'});assert.equal(result.teams[1][0].battleAppearance,'floettemega');assert.equal(result.teams[1][0].mega,true);
 }
 assert.equal(infiniteRivalBattleTeam({}),null);assert.ok(infiniteRewardTeam({zaIntroStarterSpecies:152},{id:'infinite-rival',team:[]}));
});

test('post-Zygarde rival rematch has the higher-level Mega starter instead of Floette',()=>{
 for(const [starter,ace,item] of [['grass',500,'emboarite'],['fire',160,'feraligite'],['water',154,'meganiumite']]){
  const team=infiniteRivalBattleTeam({zaMission10Starter:starter,zaInfiniteRewardWins:20,zaMission42Complete:true});assert.deepEqual(team.map(p=>p.level),[74,74,75,75,76,76]);assert.equal(team[5].id,ace);assert.equal(team[5].item,item);assert.ok(!team.some(p=>p.id===10061));
 }
});

test('legacy random rival before Zygarde uses the original mission 36 team',()=>{
 const state={zaMission10Starter:'grass',zaInfiniteRewardWins:20,zaMission42Complete:false},team=infiniteRivalBattleTeam(state);
 assert.deepEqual(team.map(p=>p.id),[678,706,713,160,310,500]);assert.deepEqual(team.map(p=>p.level),[62,62,62,63,63,64]);assert.equal(team[5].item,'emboarite');assert.deepEqual(infiniteRewardTeam(state,{id:'infinite-rival',team:[]}).team,team.map(p=>[p.id,p.level]));
});
