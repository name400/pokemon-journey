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
 assert.deepEqual(player,before);assert.equal(fight.format,'mission10-multi-v1');assert.equal(fight.teams[0].length,6);assert.equal(fight.teams[2].length,3);assert.deepEqual(fight.owners.player,player.map(m=>m.boxId));assert.deepEqual(fight.owners.ally,ally.map(m=>m.boxId));
 const restored=Battle.fromJSON(JSON.parse(JSON.stringify(fight.snapshot)));assert.equal(restored.gameType,'multi');assert.deepEqual(restored.sides.map(side=>side.active[0]?.set.trainerToken),['owned-0','mission10-guard-0','mission10-ally-0','mission10-guard-1']);assert.ok(restored.format.customRules.includes('!Sleep Clause Mod'));assert.ok(restored.p1.active[0].hp<restored.p1.active[0].maxhp);assert.equal(restored.p1.pokemon.find(p=>p.set.trainerToken==='owned-1').hp,0);
 assert.throws(()=>createMission10DoubleSnapshot([],ally,foes));assert.throws(()=>createMission10DoubleSnapshot([player[0]],ally,[foes[0],foes[0]]));
});

test('isolated multi turn targets the selected guard and keeps the partner roster separate',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const p={...makeMon(150,100),boxId:'owned',moves:['사이코키네시스'],pp:{}},backup={...makeMon(25,30),boxId:'owned-backup'},t=mission10GuardTeams('grass'),start=createMission10DoubleSnapshot([p,backup],t.ally,t.foes);
 assert.throws(()=>playMission10MultiTurn(start,{type:'move',move:'psychic',target:3}));assert.throws(()=>playMission10MultiTurn(start,{type:'switch',slot:3}));
 const next=playMission10MultiTurn(start,{type:'move',move:'psychic',target:2}),b=Battle.fromJSON(JSON.parse(JSON.stringify(next.snapshot)));assert.ok(b.turn>1||b.ended);assert.equal(b.p4.pokemon[0].hp,0);assert.deepEqual(b.p1.pokemon.map(x=>x.set.trainerToken),['owned','owned-backup']);assert.deepEqual(b.p3.pokemon.map(x=>x.set.trainerToken),t.ally.map(x=>x.boxId));
});


test('isolated multi battle supports a player switch and resumes to victory',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const lead={...makeMon(150,100),boxId:'own-lead',moves:['사이코키네시스'],pp:{}},reserve={...makeMon(150,100),boxId:'own-reserve',moves:['사이코키네시스'],pp:{}},t=mission10GuardTeams('fire');let fight=createMission10DoubleSnapshot([lead,reserve],t.ally,t.foes);
 fight=playMission10MultiTurn(fight,{type:'switch',slot:2});let b=Battle.fromJSON(fight.snapshot);assert.equal(b.p1.active[0].set.trainerToken,'own-reserve');assert.deepEqual(fight.owners.ally,t.ally.map(p=>p.boxId));
 for(let i=0;i<8&&!b.ended;i++){const target=b.p2.active[0]?.hp>0?1:2;fight=playMission10MultiTurn(fight,{type:'move',move:'psychic',target});b=Battle.fromJSON(fight.snapshot);}
 assert.equal(b.ended,true);assert.equal(b.p2.pokemon[0].hp,0);assert.equal(b.p4.pokemon[0].hp,0);assert.ok(fight.teams[0].every(p=>p.boxId.startsWith('own-')));assert.ok(fight.teams[2].every(p=>p.boxId.startsWith('mission10-ally-')));
});

test('isolated multi battle requires a player-owned replacement after fainting',async()=>{
 const {Battle}=await import('@pkmn/sim');const {mission10GuardTeams}=await import('../lib/cloud-adventure/adventure-mission10.mjs');const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const lead={...makeMon(25,30),boxId:'lead',hp:1,moves:['튀어오르기'],pp:{}},reserve={...makeMon(25,30),boxId:'reserve'},t=mission10GuardTeams('grass');let fight=createMission10DoubleSnapshot([lead,reserve],t.ally,t.foes);
 fight=playMission10MultiTurn(fight,{type:'move',move:'splash'});let b=Battle.fromJSON(fight.snapshot);assert.equal(b.p1.active[0].hp,0);assert.equal(b.p1.activeRequest.forceSwitch[0],true);assert.equal(fight.teams[0].find(p=>p.boxId==='lead').hp,0);
 assert.throws(()=>playMission10MultiTurn(fight,{type:'switch',slot:3}));fight=playMission10MultiTurn(fight,{type:'switch',slot:2});b=Battle.fromJSON(fight.snapshot);assert.equal(b.p1.active[0].set.trainerToken,'reserve');assert.ok(b.p3.pokemon.every(p=>p.set.trainerToken.startsWith('mission10-ally-')));
});
