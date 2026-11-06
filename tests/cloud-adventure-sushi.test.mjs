import test from 'node:test';
import assert from 'node:assert/strict';
import {sushiCourseTeam,SUSHI_COURSE_COUNT} from '../lib/cloud-adventure/adventure-sushi.mjs';
import {makeMon,moves} from '../lib/game.mjs';
import {createCombat,validateCombatCommand} from '../lib/party-battle.mjs';

test('five restaurant courses have independent level-50 opponents with valid source moves',()=>{
 assert.equal(SUSHI_COURSE_COUNT,5);
 const expected=[[666,15,168],[702,26,587],[212,707,448],[709,711,609],[135,134,136]];
 for(let i=0;i<5;i++){const team=sushiCourseTeam(i);assert.deepEqual(team.map(m=>m.speciesId),expected[i]);assert.equal(new Set(team.map(m=>m.boxId)).size,3);for(const mon of team){assert.equal(mon.level,50);assert.equal(mon.moves.length,4);assert.ok(mon.moves.every(m=>Object.hasOwn(moves,m)));}team[0].hp=0;assert.ok(sushiCourseTeam(i)[0].hp>0);}
 for(const i of [-1,5,0.5,NaN,'0'])assert.throws(()=>sushiCourseTeam(i));
});

test('representative course can enter the current turn-based battle engine',()=>{
 const player={...makeMon(150,50),boxId:'player'};const battle=createCombat([player],sushiCourseTeam(0));
 assert.equal(battle.teams[1].length,3);assert.ok(battle.requests[0].moves.length);validateCombatCommand(battle,0,{type:'move',move:battle.requests[0].moves[0].id});
});
