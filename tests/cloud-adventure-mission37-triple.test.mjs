import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {mission37CompanionGroups} from '../lib/cloud-adventure/adventure-mission37-companions.mjs';
import {createMission37TripleSnapshot,restoreMission37TripleSnapshot,playMission37TriplePrototype,mission37PlayerTeam,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';

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

test('prototype chooses two ally turns and refuses cross-owner switches without changing the snapshot',()=>{
 const owned=Array.from({length:2},(_,i)=>({...makeMon(25,60),boxId:`player-${i}`,moves:['튀어오르기'],pp:{}}));
 const [{team:first},{team:second}]=mission37CompanionGroups(2),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const initial=createMission37TripleSnapshot(owned,first,second,foes),original=JSON.stringify(initial),allySlot=initial.teams[0].findIndex(mon=>mon.boxId===first[1].boxId)+1;
 assert.throws(()=>playMission37TriplePrototype(initial,{type:'switch',slot:allySlot}),/소유자|동료/);assert.throws(()=>playMission37TriplePrototype(initial,null),/플레이어/);assert.throws(()=>playMission37TriplePrototype(initial,{type:'move',move:'splash',special:'mega'}),/플레이어/);assert.equal(JSON.stringify(initial),original);
 const turn=playMission37TriplePrototype(initial,{type:'move',move:'splash'});assert.equal(restoreMission37TripleSnapshot(turn).turn,2);for(const side of ['p1a:','p1b:','p1c:'])assert.ok(turn.log.some(line=>line.startsWith(`|move|${side}`)),side);assert.deepEqual(turn.owners,initial.owners);assert.deepEqual(playMission37TriplePrototype(JSON.parse(JSON.stringify(turn)),{type:'move',move:'splash'}).owners,initial.owners);
 const switched=playMission37TriplePrototype(initial,{type:'switch',slot:4});assert.equal(restoreMission37TripleSnapshot(switched).p1.active[0].set.trainerToken,'player-1');assert.deepEqual(switched.owners.player,['player-0','player-1']);
});

test('prototype forced switches stay with the fainted owner, including an exhausted owner',()=>{
 const owned=[{...makeMon(25,60),boxId:'owned',moves:['튀어오르기'],pp:{}}],groups=mission37CompanionGroups(2),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const checkpoint=first=>{const c=createMission37TripleSnapshot(owned,first,groups[1].team,foes),b=restoreMission37TripleSnapshot(c),fainted=b.p1.active[1];fainted.hp=0;fainted.fainted=true;fainted.status='fnt';b.p1.pokemonLeft--;b.checkFainted();b.makeRequest('switch');const snap=b.toJSON();snap.formatid=c.snapshot.formatid;return {...c,snapshot:snap};};
 const pending=checkpoint(groups[0].team),next=playMission37TriplePrototype(pending,null),battle=restoreMission37TripleSnapshot(next);assert.equal(battle.p1.active[1].set.trainerToken,groups[0].team[1].boxId);assert.equal(battle.p1.active[2].set.trainerToken,groups[1].team[0].boxId);
 const exhausted=checkpoint([groups[0].team[0]]),before=JSON.stringify(exhausted),continued=playMission37TriplePrototype(exhausted,null),restored=restoreMission37TripleSnapshot(continued);assert.equal(JSON.stringify(exhausted),before);assert.equal(restored.p1.active[1].set.trainerToken,groups[0].team[0].boxId);assert.equal(restored.p1.active[1].fainted,true);assert.equal(restored.p1.active[2].set.trainerToken,groups[1].team[0].boxId);
 const afterTurn=playMission37TriplePrototype(JSON.parse(JSON.stringify(continued)),{type:'move',move:'splash'});assert.equal(restoreMission37TripleSnapshot(afterTurn).p1.active[1].fainted,true);assert.ok(afterTurn.log.some(line=>line.startsWith('|move|p1c:')));
});

test('prototype resolves victory and preserves owner parties after restoring the finished battle',()=>{
 const player=[{...makeMon(150,100),boxId:'player',moves:['스피드스타'],pp:{}}],groups=mission37CompanionGroups(2);
 const foes=Array.from({length:3},(_,i)=>{const mon=makeMon(143,1);return {...mon,boxId:`foe-${i}`,hp:1,moves:['튀어오르기'],pp:{}};});
 const initial=createMission37TripleSnapshot(player,groups[0].team,groups[1].team,foes);
 const result=playMission37TriplePrototype(initial,{type:'move',move:'swift'});assert.equal(result.ended,true);assert.equal(result.winner,0);assert.deepEqual(result.owners,initial.owners);assert.equal(restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(result))).ended,true);assert.throws(()=>playMission37TriplePrototype(result,null),/끝난/);
});

test('triple view exposes three active slots but only player-owned switches and persistence entries',()=>{
 const player=Array.from({length:2},(_,i)=>({...makeMon(25,60),boxId:`player-view-${i}`,moves:['전기쇼크'],pp:{}})),groups=mission37CompanionGroups(2),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`foe-view-${i}`,moves:['튀어오르기'],pp:{}}));
 const combat=createMission37TripleSnapshot(player,groups[0].team,groups[1].team,foes),view=mission37TripleView(JSON.parse(JSON.stringify(combat)));
 assert.deepEqual(mission37PlayerTeam(combat).map(mon=>mon.boxId),player.map(mon=>mon.boxId));assert.deepEqual(view.activeBySide.map(side=>side.length),[3,3]);assert.deepEqual(view.requests[0].switches.map(p=>view.teams[0][p.index].boxId),[player[1].boxId]);
 for(let i=0;i<3;i++)assert.equal(view.teams[0][view.activeBySide[0][i]].boxId,[player[0],groups[0].team[0],groups[1].team[0]][i].boxId);
 const move=view.requests[0].moves[0];assert.ok(move.targets.some(target=>target.side===1));assert.ok(move.targets.every(target=>target.index===view.activeBySide[target.side][target.slot]));
 assert.throws(()=>mission37PlayerTeam({...combat,owners:{...combat.owners,player:['missing']}}),/포켓몬/);
});
