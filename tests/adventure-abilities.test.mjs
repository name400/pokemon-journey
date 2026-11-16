import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat} from '../lib/party-battle.mjs';
import {adventurePlayCpu} from '../lib/adventure-tera-policy.mjs';
import {createZAAbilityCombat,adventureNativeTeamSet} from '../lib/cloud-adventure/adventure-abilities.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,restoreMission37TripleSnapshot} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,ability,moves=['튀어오르기'])=>({...makeMon(id,50),boxId,ability,moves,pp:{}});
test('new ZA singles suppress Levitate without changing original ability or existing combats',()=>{
 const player=mon(150,'p','pressure',['지진']),foe=mon(604,'e','levitate'),before=structuredClone([player,foe]);
 const legacy=createCombat([player],[foe]),battle=createZAAbilityCombat([player],[foe]);
 assert.equal(Battle.fromJSON(battle.snapshot).p2.active[0].ability,'noability');assert.equal(Battle.fromJSON(legacy.snapshot).p2.active[0].ability,'levitate');
 const next=adventurePlayCpu(JSON.parse(JSON.stringify(battle)),{type:'move',move:'지진'});assert.ok(next.teams[1][0].hp<foe.hp);assert.equal(next.teams[1][0].ability,'levitate');assert.deepEqual([player,foe],before);
 const old=adventurePlayCpu(JSON.parse(JSON.stringify(legacy)),{type:'move',move:'지진'});assert.equal(old.teams[1][0].hp,foe.hp);
});
test('ordinary status and entry abilities are suppressed but confirmed form effects remain',()=>{
 const attacker=mon(150,'p','pressure',['몸통박치기']),target=mon(25,'e','static'),s=createZAAbilityCombat([attacker],[target]);
 assert.equal(Battle.fromJSON(s.snapshot).p2.active[0].ability,'noability');
 assert.equal(adventureNativeTeamSet(mon(681,'a','stancechange'),0).ability,'stancechange');
 assert.equal(adventureNativeTeamSet(mon(778,'m','disguise'),0).ability,'disguise');
 assert.equal(adventureNativeTeamSet(mon(877,'h','hungerswitch'),0).ability,'hungerswitch');
 assert.equal(adventureNativeTeamSet(mon(25,'u','unreviewed'),0).ability,'unreviewed');
 const blade=createZAAbilityCombat([mon(681,'blade','stancechange',['야습'])],[mon(25,'target','static')]);assert.equal(adventurePlayCpu(blade,{type:'move',move:'야습'}).teams[0][0].battleAppearance,'aegislashblade');
 const i=createZAAbilityCombat([mon(25,'p','static')],[mon(128,'e','intimidate')]);assert.equal(Battle.fromJSON(i.snapshot).p1.active[0].boosts.atk,0);
});
test('multi and triples suppress reviewed effects and preserve team ownership on reload',()=>{
 const p=mon(150,'p','pressure',['방어']),ally=mon(25,'a','static',['방어']),foe=mon(604,'f','levitate',['방어']),other=mon(128,'g','intimidate',['방어']);
 const double=createMission10DoubleSnapshot([p],[ally],[foe,other]);const native=Battle.fromJSON(double.snapshot);assert.equal(native.p2.active[0].ability,'noability');assert.equal(native.p1.active[0].boosts.atk,0);
 const resumed=playMission10MultiTurn(JSON.parse(JSON.stringify(double)),{type:'move',move:'protect'});assert.equal(resumed.teams[1][0].ability,'levitate');assert.deepEqual(resumed.owners,{player:['p'],ally:['a']});
 const triple=createMission37TripleSnapshot([p],[ally],[mon(1,'b','overgrow')],[foe,other]);const native3=restoreMission37TripleSnapshot(JSON.parse(JSON.stringify(triple)));assert.equal(native3.p2.active[0].ability,'noability');assert.equal(triple.teams[1][0].ability,'levitate');
});
