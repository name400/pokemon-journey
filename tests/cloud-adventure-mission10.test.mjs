import test from 'node:test';
import assert from 'node:assert/strict';
import {mission10RivalTeam} from '../lib/cloud-adventure/adventure-mission10.mjs';
import {makeMon,moves} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';

test('mission 10 rival teams follow the selected starter type',()=>{
 for(const [choice,ids] of Object.entries({grass:[159,499,310],fire:[153,159,310],water:[499,153,310]})){
  const team=mission10RivalTeam(choice);assert.deepEqual(team.map(m=>m.speciesId),ids);assert.deepEqual(team.map(m=>m.level),[25,25,26]);assert.equal(team[2].item,'manectite');assert.ok(team.every(m=>m.moves.length===4&&m.moves.every(move=>Object.hasOwn(moves,move))));
 }
 assert.throws(()=>mission10RivalTeam('__proto__'));assert.throws(()=>mission10RivalTeam(''));
});

test('rival Manectric can mega evolve in the turn-based engine',()=>{
 const player={...makeMon(150,100),boxId:'player',moves:['방어'],pp:{}};
 const battle=playCpu(createCombat([player],[mission10RivalTeam('grass')[2]]),{type:'move',move:'방어'});
 assert.equal(battle.teams[1][0].battleAppearance,'manectricmega');
});
