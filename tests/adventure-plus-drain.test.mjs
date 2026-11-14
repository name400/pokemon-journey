import test from 'node:test';import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
import {installAdventurePlusStatus} from '../lib/cloud-adventure/adventure-plus-status.mjs';
const mon=(id,boxId,move)=>({...makeMon(id,50),boxId,moves:[move],pp:{}});
const flags=c=>({...c,adventurePlusGaugeV1:{charge:3,max:3},adventurePlusStatusV1:true,adventurePlusDrainV1:true,disableCpuTera:true});
function expectDrain(before,after,ratio){const damage=before.teams[1][0].hp-after.teams[1][0].hp,healed=after.teams[0][0].hp-before.teams[0][0].hp;assert.ok(damage>0);assert.equal(healed,Math.round(damage*ratio));}
test('Dream Eater Plus drain is scoped to new battles, selected user and Mega',()=>{
 let modify;const p1={},b={format:{},p1,onEvent(_name,_format,_priority,cb){modify=cb;}};installAdventurePlusStatus(b,true,'player','dreameater',true,true,true,true,true);
 for(const [side,token,mega,expected] of [[p1,'player',false,[13,20]],[p1,'other',false,[1,2]],[{},'other',true,[13,20]]]){const move={id:'dreameater',drain:[1,2]};modify.call(b,move,{side,set:{trainerToken:token},species:{isMega:mega}});assert.deepEqual(move.drain,expected);}
 installAdventurePlusStatus(b,true,'player','dreameater',true,true,true,true,false);const legacy={id:'dreameater',drain:[1,2]};modify.call(b,legacy,{side:p1,set:{trainerToken:'player'},species:{}});assert.deepEqual(legacy.drain,[1,2]);
});
test('Dream Eater heals 50% normally and 65% when Plus in new snapshots only',()=>{
 const player={...mon(94,'player','꿈먹기'),hp:1,adventurePlusMastered:['dreameater']},foe={...makeMon(143,80),boxId:'foe',moves:['튀어오르기'],pp:{},status:'잠듦'};
 const fight=flags(createCombat([player],[foe]));fight.snapshot.prng='1,2,3,4';assert.match(combatView(fight).requests[0].moves[0].description,/65%/);assert.doesNotMatch(combatView({...fight,adventurePlusDrainV1:undefined}).requests[0].moves[0].description||'',/65%/);const ordinary=playCpu(fight,{type:'move',move:'꿈먹기'}),plus=playCpu(fight,{type:'move',move:'꿈먹기',plus:true}),old=playCpu({...structuredClone(fight),adventurePlusDrainV1:undefined},{type:'move',move:'꿈먹기',plus:true});expectDrain(fight,ordinary,.5);expectDrain(fight,plus,.65);expectDrain(fight,old,.5);assert.equal(plus.adventurePlusGaugeV1.charge,2);assert.equal(JSON.parse(JSON.stringify(plus)).adventurePlusDrainV1,true);
 const awake=flags(createCombat([player],[{...foe,status:null}]));awake.snapshot.prng='1,2,3,4';const miss=playCpu(awake,{type:'move',move:'꿈먹기',plus:true});assert.equal(miss.teams[0][0].hp,1);assert.equal(miss.teams[1][0].hp,foe.hp);
});
test('Dream Eater Plus healing works in companion and three-ally battles',()=>{
 const player={...mon(94,'player','꿈먹기'),hp:1,adventurePlusMastered:['dreameater']},ally=mon(143,'ally','튀어오르기'),ally2=mon(143,'ally2','튀어오르기'),foes=[1,2,3].map(i=>({...makeMon(143,80),boxId:`foe${i}`,moves:['튀어오르기'],pp:{},status:'잠듦'}));
 for(const [snapshot,play,view] of [[createMission10DoubleSnapshot([player],[ally],foes.slice(0,2)),playMission10MultiTurn,mission10MultiView],[createMission37TripleSnapshot([player],[ally],[ally2],foes),playMission37TriplePrototype,mission37TripleView]]){const fight=flags(snapshot);fight.snapshot.prng='1,2,3,4';assert.match(view(fight).requests[0].actors[0].moves[0].description,/65%/);const result=play(fight,{type:'move',move:'dreameater',target:1,plus:true});expectDrain(fight,result,.65);assert.equal(result.adventurePlusGaugeV1.charge,2);assert.deepEqual(result.owners,fight.owners);assert.equal(Battle.fromJSON(result.snapshot).p1.pokemon[0].hp,result.teams[0][0].hp);}
});

test('Mega automatically applies Dream Eater Plus without changing the owned item',()=>{
 const player={...mon(94,'player','꿈먹기'),hp:1,item:'gengarite'},foe={...makeMon(143,80),boxId:'foe',moves:['튀어오르기'],pp:{},status:'잠듦'};
 const fight=flags(createCombat([player],[foe]));fight.snapshot.prng='1,2,3,4';const result=playCpu(fight,{type:'move',move:'꿈먹기',special:'mega'});assert.equal(result.teams[0][0].mega,true);expectDrain(fight,result,.65);assert.equal(result.adventurePlusGaugeV1.charge,0);assert.equal(result.teams[0][0].item,'gengarite');
});
