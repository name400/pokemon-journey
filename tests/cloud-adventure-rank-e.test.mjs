import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {rankFPoints,rankFWins,RANK_F_TRAINERS} from '../lib/cloud-adventure/adventure-rank-e.mjs';

test('rank F points and session wins validate corrupted data',()=>{
 assert.equal(rankFPoints({zaRoyaleFPoints:Infinity}),0);
 assert.equal(rankFPoints({zaRoyaleFPoints:50000}),32000);
 assert.deepEqual(rankFWins({zaRoyaleFSessionWins:[RANK_F_TRAINERS[0].id,RANK_F_TRAINERS[0].id,'unknown']}),[RANK_F_TRAINERS[0].id]);
});
test('Tarragon and Canari can use their respective Mega Evolutions',()=>{
 for(const [id,item,appearance] of [[530,'excadrite','excadrillmega'],[604,'eelektrossite','eelektrossmega']]){
  let battle=createCombat([makeMon(150,40)],[{...makeMon(id,39),item}],{strategy:'balanced'});
  battle=playCpu(battle,{type:'move',move:battle.requests[0].moves[0].id});
  assert.equal(battle.teams[1][0].battleAppearance,appearance);
  assert.equal(battle.teams[1][0].mega,true);
 }
});
