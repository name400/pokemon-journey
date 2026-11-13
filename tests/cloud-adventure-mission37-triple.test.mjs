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
 assert.throws(()=>playMission37TriplePrototype(initial,{type:'switch',slot:allySlot}),/소유자|동료/);assert.throws(()=>playMission37TriplePrototype(initial,null),/플레이어/);assert.throws(()=>playMission37TriplePrototype(initial,{type:'move',move:'splash',special:'mega'}),/메가진화/);assert.equal(JSON.stringify(initial),original);
 const turn=playMission37TriplePrototype(initial,{type:'move',move:'splash'});assert.equal(restoreMission37TripleSnapshot(turn).turn,2);for(const id of [owned[0].boxId,first[0].boxId,second[0].boxId])assert.ok(turn.events.some(event=>event.kind==='move'&&event.actorBoxId===id),id);assert.deepEqual(turn.owners,initial.owners);assert.deepEqual(playMission37TriplePrototype(JSON.parse(JSON.stringify(turn)),{type:'move',move:'splash'}).owners,initial.owners);
 const switched=playMission37TriplePrototype(initial,{type:'switch',slot:4});assert.equal(restoreMission37TripleSnapshot(switched).p1.active[0].set.trainerToken,'player-1');assert.deepEqual(switched.owners.player,['player-0','player-1']);
});

test('each trainer can mega evolve independently and the usage survives reload',()=>{
 const player=[{...makeMon(6,100),boxId:'mega-player',item:'charizarditex',moves:['튀어오르기'],pp:{}}],groups=mission37CompanionGroups(6),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`mega-foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const combat=createMission37TripleSnapshot(player,groups[0].team,groups[1].team,foes);assert.ok(mission37TripleView(combat).requests[0].specials.some(s=>s.key==='mega'));
 const turn=playMission37TriplePrototype(combat,{type:'move',move:'splash',special:'mega'}),battle=restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(turn)));assert.deepEqual(turn.megaUsed,[true,true,true]);assert.ok(battle.p1.active.every(mon=>mon.species.isMega));assert.deepEqual(mission37TripleView(turn).requests[0].specials,[]);
});

test('items consume the player action and revival cannot target a companion',()=>{
 const lead={...makeMon(25,80),boxId:'item-player',moves:['튀어오르기'],pp:{}},fainted={...makeMon(4,30),boxId:'item-reserve',hp:0},groups=mission37CompanionGroups(6),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`item-foe-${i}`,moves:['튀어오르기'],pp:{}}));lead.hp=Math.floor(lead.maxHp/2);groups[0].team[1].hp=0;
 const initial=createMission37TripleSnapshot([lead,fainted],groups[0].team,groups[1].team,foes);assert.throws(()=>playMission37TriplePrototype(initial,{type:'item',item:'adventure-revive',boxId:groups[0].team[1].boxId}),/플레이어/);
 const revived=playMission37TriplePrototype(initial,{type:'item',item:'adventure-revive',boxId:fainted.boxId});assert.ok(mission37PlayerTeam(revived).find(m=>m.boxId===fainted.boxId).hp>0);assert.ok(revived.events.some(e=>e.kind==='heal'&&e.targetBoxId===fainted.boxId));assert.equal(restoreMission37TripleSnapshot(revived).turn,2);
 const healed=playMission37TriplePrototype(initial,{type:'item',item:'potion'});assert.ok(mission37PlayerTeam(healed).find(m=>m.boxId===lead.boxId).hp>lead.hp);assert.equal(restoreMission37TripleSnapshot(healed).turn,2);
});

test('companion-only turns persist one request at a time beyond the old 128-turn limit',()=>{
 const mon=(id)=>({...makeMon(143,50),boxId:id,moves:['튀어오르기'],pp:{}}),initial=createMission37TripleSnapshot([mon('long-player')],[mon('long-ally-1')],[mon('long-ally-2')],[mon('long-foe-1'),mon('long-foe-2'),mon('long-foe-3')]);
 const battle=restoreMission37TripleSnapshot(initial),player=battle.p1.active[0];player.hp=0;player.fainted=true;player.status='fnt';battle.p1.pokemonLeft--;for(const side of battle.sides)for(const pokemon of side.pokemon)for(const move of pokemon.moveSlots){move.pp=200;move.maxpp=200;}battle.makeRequest('move');const snapshot=battle.toJSON();snapshot.formatid=initial.snapshot.formatid;let combat={...initial,snapshot};
 for(let i=0;i<130;i++){assert.equal(mission37TripleView(combat).adventureMultiContinueV1,true);combat=playMission37TriplePrototype(combat,null);if(i===64)combat=JSON.parse(JSON.stringify(combat));assert.equal(combat.ended,false);}
 assert.equal(restoreMission37TripleSnapshot(combat).turn,131);assert.equal(combat.owners.player[0],'long-player');assert.equal(combat.events.some(event=>event.kind==='move'&&event.actorBoxId==='long-player'),false);
});

test('prototype forced switches stay with the fainted owner, including an exhausted owner',()=>{
 const owned=[{...makeMon(25,60),boxId:'owned',moves:['튀어오르기'],pp:{}}],groups=mission37CompanionGroups(2),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const checkpoint=first=>{const c=createMission37TripleSnapshot(owned,first,groups[1].team,foes),b=restoreMission37TripleSnapshot(c),fainted=b.p1.active[1];fainted.hp=0;fainted.fainted=true;fainted.status='fnt';b.p1.pokemonLeft--;b.checkFainted();b.makeRequest('switch');const snap=b.toJSON();snap.formatid=c.snapshot.formatid;return {...c,snapshot:snap};};
 const pending=checkpoint(groups[0].team);assert.equal(mission37TripleView(pending).adventureMultiContinueV1,true);const next=playMission37TriplePrototype(pending,null),battle=restoreMission37TripleSnapshot(next);assert.equal(battle.p1.active[1].set.trainerToken,groups[0].team[1].boxId);assert.equal(battle.p1.active[2].set.trainerToken,groups[1].team[0].boxId);
 const exhausted=checkpoint([groups[0].team[0]]),before=JSON.stringify(exhausted),continued=playMission37TriplePrototype(exhausted,null),restored=restoreMission37TripleSnapshot(continued);assert.equal(JSON.stringify(exhausted),before);assert.equal(restored.p1.active[1].set.trainerToken,groups[0].team[0].boxId);assert.equal(restored.p1.active[1].fainted,true);assert.equal(restored.p1.active[2].set.trainerToken,groups[1].team[0].boxId);
 const afterTurn=playMission37TriplePrototype(JSON.parse(JSON.stringify(continued)),{type:'move',move:'splash'});assert.equal(restoreMission37TripleSnapshot(afterTurn).p1.active[1].fainted,true);assert.ok(afterTurn.events.some(event=>event.kind==='move'&&event.actorBoxId===groups[1].team[0].boxId));
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

test('triple events retain each spread target, previous HP and the outgoing slot on switch',()=>{
 const player=Array.from({length:2},(_,i)=>({...makeMon(150,80),boxId:`visual-player-${i}`,moves:['스피드스타'],pp:{}})),groups=mission37CompanionGroups(2),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`visual-foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const combat=createMission37TripleSnapshot(player,groups[0].team,groups[1].team,foes),turn=playMission37TriplePrototype(combat,{type:'move',move:'swift'}),view=mission37TripleView(turn);
 assert.deepEqual(view.beforeActiveBySide.map(side=>side.length),[3,3]);assert.equal(view.before[0][view.beforeActiveBySide[0][2]].battleOwner,'ally2');for(let slot=0;slot<3;slot++){const event=turn.events.find(event=>event.kind==='damage'&&event.targetBoxId===foes[slot].boxId);assert.ok(event,`foe ${slot}`);assert.equal(event.activeSlot,slot);assert.equal(event.beforeHp,combat.teams[1][slot].hp);assert.ok(event.hp<event.beforeHp);}
 const switched=playMission37TriplePrototype(combat,{type:'switch',slot:4});assert.equal(switched.before[0][switched.beforeActiveBySide[0][0]].boxId,player[0].boxId);assert.ok(switched.events.some(event=>event.kind==='switch'&&event.targetBoxId===player[1].boxId&&event.activeSlot===0));
});
