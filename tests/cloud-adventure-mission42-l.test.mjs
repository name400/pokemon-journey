import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSION42_L} from '../lib/cloud-adventure/adventure-mission42.mjs';
import {trainerTeam} from '../lib/campaign.mjs';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {Dex} from '@pkmn/sim';

test('L team moves exist and Gyarados can Mega Evolve when it fights',()=>{
 assert.deepEqual(MISSION42_L.team,[[668,78],[671,78],[302,78],[715,79],[569,79],[130,80]]);
 for(const set of MISSION42_L.moves)for(const move of set)assert.equal(Dex.moves.get(move).exists,true,move);
 const team=trainerTeam(MISSION42_L);team.forEach((m,i)=>{m.moves=MISSION42_L.moves[i];m.pp={};});team[5].item='gyaradosite';
 let battle=createCombat([makeMon(150,100)],[team[5]],{strategy:'balanced'});
 battle=playCpu(battle,{type:'move',move:battle.requests[0].moves[0].id});
 assert.equal(battle.teams[1][0].mega,true);assert.equal(battle.teams[1][0].battleAppearance,'gyaradosmega');
});
