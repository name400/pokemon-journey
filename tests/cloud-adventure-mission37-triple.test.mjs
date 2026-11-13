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

test('each trainer can reach the last opposing edge slot in the story battle',()=>{
 const mon=(id)=>({...makeMon(25,60),boxId:id,moves:['전기쇼크'],pp:{}}),initial=createMission37TripleSnapshot([mon('edge-player')],[mon('edge-ally1')],[mon('edge-ally2')],[mon('edge-foe1'),mon('edge-foe2'),mon('edge-foe3')]),battle=restoreMission37TripleSnapshot(initial);
 for(const foe of battle.p2.pokemon.slice(0,2)){foe.hp=0;foe.fainted=true;foe.status='fnt';battle.p2.pokemonLeft--;}battle.makeRequest('move');const snapshot=battle.toJSON();snapshot.formatid=initial.snapshot.formatid;const combat={...initial,snapshot};assert.ok(mission37TripleView(combat).requests[0].moves[0].targets.some(target=>target.side===1&&target.slot===2));const turn=playMission37TriplePrototype(combat,{type:'move',move:'thundershock',target:3});for(const id of ['edge-player','edge-ally1','edge-ally2']){assert.ok(turn.events.some(event=>event.kind==='move'&&event.actorBoxId===id),id);assert.ok(turn.events.some(event=>event.kind==='damage'&&event.actorBoxId===id&&event.targetBoxId==='edge-foe3'),`${id} reaches the foe`);}
});

test('a companion can recharge after hyper beam without blocking the next turn',()=>{
 const mon=(id,move)=>({...makeMon(143,80),boxId:id,moves:[move],pp:{}}),initial=createMission37TripleSnapshot([mon('recharge-player','튀어오르기')],[mon('recharge-ally','파괴광선')],[mon('recharge-ally2','튀어오르기')],[mon('recharge-foe1','튀어오르기'),mon('recharge-foe2','튀어오르기'),mon('recharge-foe3','튀어오르기')]);
 initial.snapshot.prng='1,2,3,4';const first=playMission37TriplePrototype(initial,{type:'move',move:'splash'}),sim=restoreMission37TripleSnapshot(first);assert.equal(sim.p1.activeRequest.active[1].moves[0].id,'recharge');const second=playMission37TriplePrototype(first,{type:'move',move:'splash'});assert.equal(restoreMission37TripleSnapshot(second).turn,3);
});

test('reserve medicine is confined to the player owner and survives restore',()=>{
 const lead={...makeMon(25,80),boxId:'medicine-player',moves:['튀어오르기'],pp:{}},reserve={...makeMon(4,30),boxId:'medicine-reserve',hp:10},groups=mission37CompanionGroups(6),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`medicine-foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const initial=createMission37TripleSnapshot([lead,reserve],groups[0].team,groups[1].team,foes),before=JSON.stringify(initial);
 assert.throws(()=>playMission37TriplePrototype(initial,{type:'item',item:'potion',boxId:groups[0].team[1].boxId}),/플레이어/);assert.equal(JSON.stringify(initial),before);
 const next=playMission37TriplePrototype(initial,{type:'item',item:'potion',boxId:reserve.boxId});assert.equal(mission37PlayerTeam(next).find(m=>m.boxId===reserve.boxId).hp,30);assert.equal(restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(next))).turn,2);
});

test('status medicine in triple battle respects ownership and restores state',()=>{
 const lead={...makeMon(25,80),boxId:'status-player',moves:['튀어오르기'],pp:{}},reserve={...makeMon(4,30),boxId:'status-reserve',status:'마비'},groups=mission37CompanionGroups(6),foes=Array.from({length:3},(_,i)=>({...makeMon(143,100),boxId:`status-foe-${i}`,moves:['튀어오르기'],pp:{}}));
 const initial=createMission37TripleSnapshot([lead,reserve],groups[0].team,groups[1].team,foes);
 assert.throws(()=>playMission37TriplePrototype(initial,{type:'item',item:'fullheal',boxId:groups[0].team[1].boxId}),/플레이어/);
 for(const item of ['fullheal','lumiosegalette']){const next=playMission37TriplePrototype(initial,{type:'item',item,boxId:reserve.boxId});assert.equal(mission37PlayerTeam(next).find(m=>m.boxId===reserve.boxId).status,null);assert.equal(restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(next))).turn,2);}
 const sim=restoreMission37TripleSnapshot(initial);sim.p1.active[0].addVolatile('confusion');const snapshot=sim.toJSON();snapshot.formatid=initial.snapshot.formatid;const confused={...initial,snapshot};assert.ok(restoreMission37TripleSnapshot(confused).p1.active[0].volatiles.confusion);for(const item of ['fullheal','fullrestore']){const cured=playMission37TriplePrototype(confused,{type:'item',item});assert.equal(restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(cured))).p1.active[0].volatiles.confusion,undefined);}
});

test('mission 36 two full partners mega evolve against two real foes and restore cleanly',async()=>{
 const {mission36PartnerGroups}=await import('../lib/cloud-adventure/adventure-mission37-companions.mjs');const groups=mission36PartnerGroups(),lead={...makeMon(25,80),boxId:'mission36-player',moves:['튀어오르기'],pp:{}},foes=[0,1].map(i=>({...makeMon(143,100),boxId:`mission36-foe-${i}`,moves:['튀어오르기'],pp:{}}));assert.deepEqual(groups.map(g=>g.team.length),[4,4]);assert.deepEqual(groups[0].team.map(m=>m.speciesId),[121,693,584,587]);assert.deepEqual(groups[1].team.map(m=>m.speciesId),[560,168,302,553]);const initial=createMission37TripleSnapshot([lead],groups[0].team,groups[1].team,foes),view=mission37TripleView(initial);assert.equal(view.teams[1].length,2);assert.deepEqual(view.activeBySide[1],[0,1,-1]);const turn=playMission37TriplePrototype(initial,{type:'move',move:'splash'});assert.deepEqual(turn.megaUsed,[false,true,true]);const saved=JSON.parse(JSON.stringify(turn)),after=mission37TripleView(saved);assert.equal(after.turn,2);assert.equal(after.teams[1].length,2);assert.ok(after.events.every(e=>!String(e.actorBoxId||'').startsWith('empty-foe-')&&!String(e.targetBoxId||'').startsWith('empty-foe-')));assert.deepEqual(mission37PlayerTeam(saved).map(m=>m.boxId),['mission36-player']);
});

test('opt-in mega plus boosts damage through reload without altering legacy snapshots',()=>{
 const mon=(species,id,level=100)=>({...makeMon(species,level),boxId:id,moves:['튀어오르기'],pp:{}}),player={...makeMon(6,30),boxId:'plus-player',item:'charizarditex',moves:['화염방사'],pp:{}},first=mon(25,'plus-ally1'),second=mon(25,'plus-ally2');
 for(const enemy of [143,208]){
  const foes=[mon(enemy,'plus-target'),mon(143,'plus-foe2'),mon(143,'plus-foe3')],base=createMission37TripleSnapshot([player],[first],[second],foes),plus={...structuredClone(base),adventureMegaPlusDamageV1:true};base.snapshot.prng='1,2,3,4';plus.snapshot.prng='1,2,3,4';
  const ordinary={type:'move',move:'flamethrower',target:1},normalWithoutMega=playMission37TriplePrototype(base,ordinary),plusWithoutMega=playMission37TriplePrototype(plus,ordinary);assert.equal(normalWithoutMega.teams[1][0].hp,plusWithoutMega.teams[1][0].hp);
  const action={type:'move',move:'flamethrower',target:1,special:'mega'},old=playMission37TriplePrototype(base,action),next=playMission37TriplePrototype(plus,action),before=foes[0].hp,normal=before-old.teams[1][0].hp,boosted=before-next.teams[1][0].hp;
  assert.ok(normal>0);assert.ok(boosted>normal,`${enemy}: ${normal} -> ${boosted}`);assert.ok(Math.abs(boosted/normal-(enemy===208?1.3:1.2))<0.12,`${enemy}: ${normal} -> ${boosted}`);assert.equal(base.adventureMegaPlusDamageV1,undefined);assert.equal(mission37TripleView(old).adventureMegaPlusDamageV1,false);assert.equal(mission37TripleView(JSON.parse(JSON.stringify(next))).adventureMegaPlusDamageV1,true);assert.equal(restoreMission37TripleSnapshot(next).turn,2);const again=playMission37TriplePrototype(JSON.parse(JSON.stringify(next)),{type:'move',move:'flamethrower',target:1}),againLegacy=playMission37TriplePrototype({...JSON.parse(JSON.stringify(next)),adventureMegaPlusDamageV1:false},{type:'move',move:'flamethrower',target:1});assert.ok(again.teams[1][0].hp<againLegacy.teams[1][0].hp,JSON.stringify({enemy,before:next.teams[1][0].hp,plus:again.teams[1][0].hp,base:againLegacy.teams[1][0].hp,log:again.log,baseLog:againLegacy.log}));
 }
});

test('opt-in applies mega plus damage to rogue mega opponents too',()=>{
 const mon=(species,id,level)=>({...makeMon(species,level),boxId:id,moves:['튀어오르기'],pp:{}}),player=mon(25,'opposing-plus-player',100),ally=mon(25,'opposing-plus-ally',100),ally2=mon(25,'opposing-plus-ally2',100),mega={...makeMon(10038,50),boxId:'opposing-plus-mega',moves:['섀도볼'],pp:{}},foes=[mega,mon(143,'opposing-plus-foe2',100),mon(143,'opposing-plus-foe3',100)],base=createMission37TripleSnapshot([player],[ally],[ally2],foes),old=playMission37TriplePrototype(base,{type:'move',move:'splash'}),next=playMission37TriplePrototype({...structuredClone(base),adventureMegaPlusDamageV1:true},{type:'move',move:'splash'});assert.ok(next.teams[0][0].hp<old.teams[0][0].hp);assert.ok(old.teams[0][0].hp<player.hp);
});
