import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {Dex} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
import {installAdventurePlusStatus} from '../lib/cloud-adventure/adventure-plus-status.mjs';
const mon=(id,boxId,move)=>({...makeMon(id,50),boxId,moves:[move],pp:{}});
const boosted=c=>Battle.fromJSON(c.snapshot).p1.pokemon[0].boosts.spa;
const flags=c=>({...c,adventurePlusGaugeV1:{charge:1,max:3},adventurePlusStatusV1:true,adventurePlusAttackEffectsV1:true,disableCpuTera:true});

test('Plus secondary chances are scoped to the selected user or Mega and leave legacy moves alone',()=>{
 for(const [id,chance] of [['chargebeam',100],['scald',50],['ancientpower',60],['ominouswind',60],['silverwind',60]]){
  let modify;const p1={},battle={format:{},p1,onEvent(_name,_format,_order,cb){modify=cb;}};
  installAdventurePlusStatus(battle,true,'player',id,true,true,true);
  const base=Dex.moves.get(id),move=structuredClone({id,secondaries:base.secondaries,secondary:base.secondary});
  modify.call(battle,move,{side:p1,set:{trainerToken:'player'},species:{}});assert.equal(move.secondaries[0].chance,chance);
  const other=structuredClone({id,secondaries:base.secondaries,secondary:base.secondary});modify.call(battle,other,{side:p1,set:{trainerToken:'other'},species:{}});assert.equal(other.secondaries[0].chance,base.secondaries[0].chance);
  const mega=structuredClone({id,secondaries:base.secondaries,secondary:base.secondary});modify.call(battle,mega,{side:{},set:{},species:{isMega:true}});assert.equal(mega.secondaries[0].chance,chance);
  installAdventurePlusStatus(battle,true,'player',id,true,true,false);const old=structuredClone({id,secondaries:base.secondaries,secondary:base.secondary});modify.call(battle,old,{side:p1,set:{trainerToken:'player'},species:{}});assert.equal(old.secondaries[0].chance,base.secondaries[0].chance);
 }
});

test('Charge Beam Plus guarantees its boost on hit while old snapshots retain their chance',()=>{
 const player={...mon(25,'player','차지빔'),adventurePlusMastered:['chargebeam']},enemy=mon(143,'enemy','튀어오르기');let witnessed=false;
 for(let i=1;i<=80&&!witnessed;i++){
  const fresh=flags(createCombat([player],[enemy]));fresh.snapshot.prng=`${i},2,3,4`;
  const old={...structuredClone(fresh),adventurePlusAttackEffectsV1:false};
  const a=playCpu(old,{type:'move',move:'차지빔',plus:true}),b=playCpu(fresh,{type:'move',move:'차지빔',plus:true});
  if(a.teams[1][0].hp<enemy.hp&&boosted(a)===0){assert.equal(boosted(b),1);assert.equal(b.adventurePlusGaugeV1.charge,0);assert.equal(boosted(JSON.parse(JSON.stringify(b))),1);witnessed=true;}
 }
 assert.ok(witnessed,'a hit where the legacy secondary roll fails');
});

test('Scald Plus applies its improved burn chance without changing old battles',()=>{
 const player={...mon(7,'player','열탕'),adventurePlusMastered:['scald']},enemy=mon(143,'enemy','튀어오르기');let witnessed=false;
 for(let i=1;i<=80&&!witnessed;i++){
  const fresh=flags(createCombat([player],[enemy]));fresh.snapshot.prng=`${i},2,3,4`;
  const old={...structuredClone(fresh),adventurePlusAttackEffectsV1:false};
  const a=playCpu(old,{type:'move',move:'열탕',plus:true}),b=playCpu(fresh,{type:'move',move:'열탕',plus:true});
  if(a.teams[1][0].hp<enemy.hp&&!a.teams[1][0].status&&b.teams[1][0].status==='화상'){assert.equal(b.adventurePlusGaugeV1.charge,0);witnessed=true;}
 }
 assert.ok(witnessed,'a hit whose burn roll lies between the old and new chance');
});

test('Charge Beam Plus is active in companion and three-ally fights',()=>{
 const p={...mon(25,'player','차지빔'),adventurePlusMastered:['chargebeam']},ally=mon(143,'ally','튀어오르기'),ally2=mon(143,'ally2','튀어오르기'),foes=[1,2,3].map(i=>mon(143,`foe${i}`,'튀어오르기'));
 for(const [c,play] of [[createMission10DoubleSnapshot([p],[ally],foes.slice(0,2)),playMission10MultiTurn],[createMission37TripleSnapshot([p],[ally],[ally2],foes),playMission37TriplePrototype]]){
  const fight=flags(c);fight.snapshot.prng='1,2,3,4';const next=play(fight,{type:'move',move:'chargebeam',target:1,plus:true});assert.equal(boosted(next),1);assert.equal(next.adventurePlusGaugeV1.charge,0);assert.equal(boosted(JSON.parse(JSON.stringify(next))),1);
 }
});
