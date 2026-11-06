import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon,moves} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {vinnieTeam} from '../lib/cloud-adventure/adventure-vinnie.mjs';
import {royaleVPoints,royaleVReady,royaleVWins} from '../lib/cloud-adventure/adventure-royale.mjs';

test('Vinnie has the sourced team and Mega Drampa',()=>{
 const team=vinnieTeam();assert.deepEqual(team.map(m=>m.speciesId),[229,319,427,780]);assert.deepEqual(team.map(m=>m.level),[30,30,30,32]);assert.equal(team[3].item,'drampanite');assert.ok(team.every(m=>m.moves.every(move=>Object.hasOwn(moves,move))));
 const p={...makeMon(150,100),boxId:'player',moves:['방어'],pp:{}};const result=playCpu(createCombat([p],[team[3]]),{type:'move',move:'방어'});assert.equal(result.teams[1][0].battleAppearance,'drampamega');
});
test('rank V ticket checks reject malformed points and duplicate wins',()=>{
 assert.equal(royaleVPoints({zaRoyaleVPoints:-1}),0);assert.equal(royaleVReady({zaRoyaleRank:'V',zaMission10Stage:4,zaRoyaleVPoints:6000}),true);assert.equal(royaleVReady({zaRoyaleRank:'V',zaMission10Stage:3,zaRoyaleVPoints:6000}),false);assert.deepEqual(royaleVWins({zaRoyaleVSessionWins:['royale-v-jaques','royale-v-jaques','bad']}),['royale-v-jaques']);
});
