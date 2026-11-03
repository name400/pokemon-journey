import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {adventureBattleParty,createAdventureCombat,createAdventureWildCombat,reviveAdventureBench} from '../lib/adventure-combat.mjs';
import {playCpu} from '../lib/party-battle.mjs';

test('entry animations retain saved HP and status for both sides',()=>{
 const player=configure(makeMon(2,16)),wild=configure(makeMon(43,20));
 Object.assign(player,{boxId:'player',hp:17,status:'독'});Object.assign(wild,{boxId:'wild',hp:9,status:'마비'});
 const combat=createAdventureCombat([player],[wild]);
 for(const side of [0,1]){
  const mon=combat.teams[side][0],entry=combat.events.find(e=>e.kind==='switch'&&e.side===side);
  assert.ok(entry);assert.equal(entry.hp,mon.hp);assert.equal(entry.maxHp,mon.maxHp);assert.equal(entry.status,mon.status);
  assert.equal(entry.pokemon.hp,mon.hp);assert.equal(entry.pokemon.status,mon.status);
 }
 assert.equal(combat.teams[0][0].hp,17);assert.equal(combat.teams[0][0].status,'독');
});
test('ordinary wild opponents cannot automatically Terastallize',()=>{
 const player=configure({...makeMon(1,5),boxId:'player'}),wild=configure({...makeMon(25,8),boxId:'wild'}),combat=createAdventureWildCombat([player],[wild]);
 assert.ok(combat.requests[0].specials.some(item=>item.key==='terastallize'),'player options remain available');
 assert.ok(combat.snapshot.sides[1].pokemon.every(p=>p.canTerastallize===null));
 const nonDamage=combat.requests[0].moves.find(move=>move.power===0);assert.ok(nonDamage);
 const next=playCpu(combat,{type:'move',move:nonDamage.name});assert.ok(next.teams[1].every(mon=>!mon.terastallized));
});
test('the selected lead starts the next battle without changing saved party order',()=>{
 const first=configure({...makeMon(1,10),boxId:'first'}),selected=configure({...makeMon(7,10),boxId:'selected'}),world={teamIds:['first','selected'],activeId:'selected'},mons=new Map([['first',first],['selected',selected]]);
 const party=adventureBattleParty(world,mons);assert.deepEqual(party.map(mon=>mon.boxId),['selected','first']);assert.deepEqual(world.teamIds,['first','selected']);
 const foe=configure({...makeMon(10,5),boxId:'foe'}),combat=createAdventureWildCombat(party,[foe]);assert.equal(combat.teams[0][combat.requests[0].active].boxId,'selected');
});
test('battle revival restores a fainted bench member and spends a turn',()=>{
 const active=configure({...makeMon(2,30),boxId:'active'}),fainted=configure({...makeMon(25,30),boxId:'fainted'}),enemy=configure({...makeMon(10,8),boxId:'enemy',moves:['몸통박치기']});fainted.hp=0;
 const combat=createAdventureCombat([active,fainted],[enemy]);assert.equal(combat.requests[0].kind,'move');assert.throws(()=>reviveAdventureBench(combat,'active'));assert.throws(()=>reviveAdventureBench({...combat,requests:[{...combat.requests[0],kind:'switch'},combat.requests[1]]},'fainted'));
 const next=reviveAdventureBench(combat,'fainted'),restored=next.teams[0].find(p=>p.boxId==='fainted');assert.equal(restored.hp,Math.max(1,Math.floor(restored.maxHp/2)));assert.equal(combat.teams[0].find(p=>p.boxId==='fainted').hp,0);assert.equal(next.snapshot.sides[0].pokemonLeft,2);assert.ok(next.turn>combat.turn);assert.ok(next.log.some(line=>line.includes('기력의조각')));assert.ok(next.teams[0].find(p=>p.boxId==='active').hp<active.hp,'opponent takes its turn');
 assert.ok(!next.log.includes(`${active.baseName||active.name}에게 도구를 사용했다.`));const switchSlot=next.requests[0].switches.find(s=>s.index===next.teams[0].findIndex(p=>p.boxId==='fainted'));assert.ok(switchSlot);const switched=playCpu(next,{type:'switch',slot:switchSlot.slot});assert.equal(switched.teams[0][switched.requests[0].active].boxId,'fainted');assert.ok(switched.teams[0][switched.requests[0].active].hp>0);
});
test('a revived teammate remains available if the opponent faints the active Pokémon',()=>{
 const active=configure({...makeMon(10,5),boxId:'active'}),fainted=configure({...makeMon(3,50),boxId:'fainted'}),enemy=configure({...makeMon(150,100),boxId:'enemy',moves:['몸통박치기']});active.hp=1;fainted.hp=0;
 const next=reviveAdventureBench(createAdventureCombat([active,fainted],[enemy]),'fainted');assert.equal(next.ended,false);assert.equal(next.requests[0].kind,'switch');const revived=next.requests[0].switches.find(s=>next.teams[0][s.index]?.boxId==='fainted');assert.ok(revived);const switched=playCpu(next,{type:'switch',slot:revived.slot});assert.equal(switched.teams[0][switched.requests[0].active].boxId,'fainted');assert.ok(switched.teams[0][switched.requests[0].active].hp>0);
});
