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

test('mission 10 partner and guards have separate, valid temporary teams',async()=>{
 const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');
 for(const [choice,ids] of Object.entries({grass:[159,499,310],fire:[153,159,310],water:[499,153,310]})){
  const {ally,foes}=mission10GuardTeams(choice);
  assert.deepEqual(ally.map(m=>m.speciesId),ids);assert.deepEqual(ally.map(m=>m.level),[29,29,30]);
  assert.deepEqual(foes.map(m=>m.speciesId),[702,702]);assert.deepEqual(foes.map(m=>m.level),[30,30]);
  assert.equal(new Set([...ally,...foes].map(m=>m.boxId)).size,5);
  assert.ok([...ally,...foes].every(m=>m.moves.length===4&&m.moves.every(move=>Object.hasOwn(moves,move))));
 }
 assert.throws(()=>mission10GuardTeams('__proto__'));assert.throws(()=>mission10GuardTeams(''));
});

test('isolated mission 10 double snapshot preserves both sides, ownership and existing HP',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const player=Array.from({length:6},(_,i)=>({...makeMon(25,30),boxId:`owned-${i}`}));player[0].hp=Math.floor(player[0].maxHp/2);player[1].hp=0;
 const before=structuredClone(player),{ally,foes}=mission10GuardTeams('grass'),fight=createMission10DoubleSnapshot(player,ally,foes);
 assert.deepEqual(player,before);assert.equal(fight.format,'mission10-double-v1');assert.equal(fight.teams[0].length,9);assert.deepEqual(fight.owners.player,player.map(m=>m.boxId));assert.deepEqual(fight.owners.ally,ally.map(m=>m.boxId));
 const restored=Battle.fromJSON(JSON.parse(JSON.stringify(fight.snapshot)));assert.equal(restored.gameType,'doubles');assert.deepEqual(restored.p1.active.map(p=>p.set.trainerToken),['owned-0','mission10-ally-0']);assert.deepEqual(restored.p2.active.map(p=>p.set.trainerToken),['mission10-guard-0','mission10-guard-1']);assert.ok(restored.p1.active[0].hp<restored.p1.active[0].maxhp);assert.equal(restored.p1.pokemon.find(p=>p.set.trainerToken==='owned-1').hp,0);
 assert.throws(()=>createMission10DoubleSnapshot([],ally,foes));assert.throws(()=>createMission10DoubleSnapshot([player[0]],ally,[foes[0],foes[0]]));
});
