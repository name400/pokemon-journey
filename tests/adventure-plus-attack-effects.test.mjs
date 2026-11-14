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

test('Fake Out and First Impression Plus critically hit without changing older battles',()=>{
 for(const [move,id] of [['속이기','fakeout'],['만나자마자','firstimpression']]){
  const p={...mon(25,'p',move),adventurePlusMastered:[id]},foe=mon(143,'foe','튀어오르기'),old=flags(createCombat([p],[foe])),fresh={...old,adventurePlusCritV1:true};old.snapshot.prng='1,2,3,4';
  const legacy=playCpu(old,{type:'move',move,plus:true}),ordinary=playCpu(fresh,{type:'move',move}),plus=playCpu(fresh,{type:'move',move,plus:true});
  assert.equal(legacy.events.find(e=>e.kind==='damage'&&e.targetBoxId==='foe')?.critical,false,id);assert.equal(ordinary.events.find(e=>e.kind==='damage'&&e.targetBoxId==='foe')?.critical,false,id);assert.equal(plus.events.find(e=>e.kind==='damage'&&e.targetBoxId==='foe')?.critical,true,id);assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.equal(JSON.parse(JSON.stringify(plus)).adventurePlusCritV1,true);
 }
});

test('Plus critical still honors immunity, critical-blocking and first-turn restrictions',()=>{
 const p={...mon(25,'p','속이기'),adventurePlusMastered:['fakeout']},ghost=mon(92,'ghost','튀어오르기'),shell={...mon(143,'shell','튀어오르기'),ability:'shellarmor'};
 for(const foe of [ghost,shell]){const c={...flags(createCombat([p],[foe])),adventurePlusCritV1:true};c.snapshot.prng='1,2,3,4';const next=playCpu(c,{type:'move',move:'속이기',plus:true});if(foe===ghost)assert.equal(next.teams[1][0].hp,foe.hp);else{const event=next.events.find(e=>e.kind==='damage'&&e.targetBoxId==='shell');assert.ok(event);assert.equal(event.critical,false);}}
 const starter={...mon(25,'p','튀어오르기'),moves:['튀어오르기','만나자마자'],adventurePlusMastered:['firstimpression']},foe=mon(143,'foe','튀어오르기');let c={...flags(createCombat([starter],[foe])),adventurePlusCritV1:true};c=playCpu(c,{type:'move',move:'튀어오르기'});const before=c.teams[1][0].hp;c=playCpu(JSON.parse(JSON.stringify(c)),{type:'move',move:'만나자마자',plus:true});assert.equal(c.teams[1][0].hp,before);
});

test('First Impression Plus applies to the selected player in multi and triple battles',()=>{
 const p={...mon(25,'p','만나자마자'),adventurePlusMastered:['firstimpression']},ally=mon(143,'ally','튀어오르기'),ally2=mon(143,'ally2','튀어오르기'),foes=[1,2,3].map(i=>mon(143,`foe${i}`,'튀어오르기'));
 for(const [snapshot,play] of [[createMission10DoubleSnapshot([p],[ally],foes.slice(0,2)),playMission10MultiTurn],[createMission37TripleSnapshot([p],[ally],[ally2],foes),playMission37TriplePrototype]]){const c={...flags(snapshot),adventurePlusCritV1:true};c.snapshot.prng='1,2,3,4';const next=play(c,{type:'move',move:'firstimpression',target:1,plus:true});const event=next.events.find(e=>e.kind==='damage'&&e.actorBoxId==='p');assert.ok(event);assert.equal(event.critical,true);assert.equal(next.adventurePlusGaugeV1.charge,0);assert.deepEqual(next.owners,c.owners);}
});

test('Mega Fake Out receives the critical effect in new snapshots only',()=>{
 const p={...mon(428,'p','속이기'),item:'lopunnite'},foe=mon(143,'foe','튀어오르기'),old={...flags(createCombat([p],[foe])),adventurePlusGaugeV1:{charge:3,max:3}},fresh={...old,adventurePlusCritV1:true};old.snapshot.prng='1,2,3,4';
 const a=playCpu(old,{type:'move',move:'속이기',special:'mega'}),b=playCpu(fresh,{type:'move',move:'속이기',special:'mega'});assert.equal(b.teams[0][0].mega,true);assert.equal(a.events.find(e=>e.kind==='damage'&&e.targetBoxId==='foe')?.critical,false);assert.equal(b.events.find(e=>e.kind==='damage'&&e.targetBoxId==='foe')?.critical,true);
});
