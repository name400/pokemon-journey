import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {mission37CompanionGroups} from '../lib/cloud-adventure/adventure-mission37-companions.mjs';
import {createMission37TripleSnapshot,restoreMission37TripleSnapshot} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';

test('prototype snapshot has three separate allied leads and restores full owned rosters',()=>{
 const owned=Array.from({length:6},(_,i)=>({...makeMon(25,60),boxId:`owned-${i}`,moves:['튀어오르기'],pp:{}}));
 const [{team:first},{team:second}]=mission37CompanionGroups(6),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`enemy-${i}`,moves:['튀어오르기'],pp:{}}));
 const combat=createMission37TripleSnapshot(owned,first,second,foes);assert.equal(combat.teams[0].length,17);assert.deepEqual(combat.owners.player,owned.map(mon=>mon.boxId));assert.deepEqual(combat.owners.first,first.map(mon=>mon.boxId));assert.deepEqual(combat.owners.second,second.map(mon=>mon.boxId));
 const restored=restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(combat)));assert.equal(restored.format.gameType,'triples');assert.deepEqual(restored.p1.active.map(mon=>mon.set.trainerToken),[owned[0].boxId,first[0].boxId,second[0].boxId]);assert.equal(restored.p1.pokemon.length,17);assert.equal(restored.p2.active.length,3);
 const request=restored.p1.activeRequest;assert.equal(request.active.length,3);assert.equal(restored.turn,1);
 const choose=(side,opponent)=>side.activeRequest.active.map((entry,index)=>{const m=entry.moves.find(move=>!move.disabled&&move.pp>0),source=side.active[index],needsTarget=['normal','adjacentFoe','any'].includes(m.target),target=needsTarget?opponent.active.find(p=>restored.validTarget(p,source,m.target)):null;assert.ok(!needsTarget||target);return `move ${m.id}${target?` ${source.getLocOf(target)}`:''}`;}).join(', ');
 assert.equal(restored.choose('p1',choose(restored.p1,restored.p2)),true);assert.equal(restored.choose('p2',choose(restored.p2,restored.p1)),true);assert.equal(restored.turn,2);for(const label of ['p1a:','p1b:','p1c:'])assert.ok(restored.log.some(line=>line.startsWith(`|move|${label}`)),label);
 const after=restored.toJSON();after.formatid=combat.snapshot.formatid;const resumed=restoreMission37TripleSnapshot({...combat,snapshot:after});assert.equal(resumed.turn,2);assert.deepEqual(resumed.p1.active.map(mon=>mon.set.trainerToken),[owned[0].boxId,first[0].boxId,second[0].boxId]);assert.equal(resumed.p1.pokemon.length,17);
 assert.throws(()=>createMission37TripleSnapshot(owned,first,[{...second[0],boxId:owned[0].boxId}],foes),/식별자/);assert.throws(()=>restoreMission37TripleSnapshot({format:'mission10-multi-v1'}),/실험 배틀/);
});
