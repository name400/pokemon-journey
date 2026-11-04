import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {classicWinstrateTeam} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const run={wave:120,biome:1,rng:123,modifiers:[],trainerTraitsRule:'source-v1',party:[makeReferenceMon(150,70,{boxId:'ally',moves:['Tackle']})],tools:{},balls:{pokeball:5}};
const teams=Array.from({length:5},(_,i)=>classicWinstrateTeam(run,i));
assert.deepEqual(teams.map(team=>team.map(mon=>mon.rogueSourceId)),[[277,862],[407,282],[119,286,323],[308],[6101,317,85,65,555]]);
assert.deepEqual(teams.map(team=>team.length),[2,2,3,1,5]);
for(const team of teams){for(const mon of team){assert.equal(mon.moves.length,4);for(const move of mon.moves)assert.ok(Dex.moves.get(move).exists,move);assert.ok(mon.hp>0);}
 const combat=createClassicCombat(run,team,{trainer:true});const saved=JSON.parse(JSON.stringify(combat));const battle=restoreClassicNativeBattle(saved,run);assert.equal(battle.p2.pokemon.length,team.length);
}
assert.equal(teams[1][1].rogueBattleSpecies,'gardevoirmega');assert.equal(teams[2][2].rogueBattleSpecies,'cameruptmega');assert.equal(teams[3][0].rogueBattleSpecies,'medichammega');assert.equal(teams[4][3].rogueBattleSpecies,'alakazammega');
assert.equal(teams[0][0].item,'flameorb');assert.equal(teams[2][1].item,'toxicorb');assert.equal(teams[2][0].rogueBaseBoosts.hp,4);assert.equal(teams[4][1].rogueFixedModifiers.length,11);assert.ok(teams[4][1].rogueFixedModifiers.every(m=>m.transferable));
assert.throws(()=>classicWinstrateTeam(run,5));assert.throws(()=>classicWinstrateTeam(run,-1));
console.log('Winstrate fixed teams: species, moves, forms, items and battle serialization passed');
