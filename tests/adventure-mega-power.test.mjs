import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {createZAAbilityCombat} from '../lib/cloud-adventure/adventure-abilities.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype,mission37TripleView} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
import {asamiMegaFinalHit} from '../lib/cloud-adventure/adventure-mission26-asami.mjs';
const mon=(id,boxId,item='')=>({...makeMon(id,60),boxId,item,moves:['튀어오르기'],pp:{},ability:'blaze'});
const copy=x=>JSON.parse(JSON.stringify(x));
const ready=c=>({...c,adventureMegaPowerV1:{version:1,trainers:{}},adventurePlusGaugeV1:{charge:3,max:3},disableCpuTera:true});
const splash={type:'move',move:'splash'};
const mega={...splash,special:'mega'};
const actor=(c,id)=>Battle.fromJSON(c.snapshot).sides.flatMap(s=>s.pokemon).find(p=>p.set.trainerToken===id);

test('new singles expire after three active turns, retain damage/stats/ability and recharge after reconnect',()=>{
 const p=mon(6,'p','charizarditex');p.hp-=23;
 const initial=ready(createZAAbilityCombat([p],[mon(143,'foe')])),original=actor(initial,'p'),save=JSON.stringify(initial);
 let c=playCpu(initial,mega);assert.equal(JSON.stringify(initial),save);assert.equal(c.teams[0][0].mega,true);assert.equal(c.adventureMegaPowerV1.trainers.p1.active.remaining,2);
 c=playCpu(copy(c),splash);assert.equal(c.adventureMegaPowerV1.trainers.p1.active.remaining,1);
 c=playCpu(copy(c),splash);const restored=actor(c,'p');assert.equal(c.teams[0][0].mega,false);assert.equal(c.adventureMegaPowerV1.trainers.p1.active,null);assert.equal(c.adventurePlusGaugeV1.charge,0);
 assert.equal(restored.species.id,original.species.id);assert.deepEqual(restored.storedStats,original.storedStats);assert.equal(restored.ability,original.ability);assert.equal(restored.baseAbility,original.baseAbility);assert.equal(restored.hp,original.hp);assert.equal(restored.maxhp,original.maxhp);assert.equal(c.teams[0][0].ability,p.ability);
 assert.ok(c.events.some(e=>e.kind==='form'&&e.pokemon?.mega===false));assert.equal(combatView(copy(c)).requests[0].specials.some(s=>s.key==='mega'),false);
 for(let i=0;i<3;i++)c=playCpu(copy(c),splash);
 assert.equal(c.adventurePlusGaugeV1.charge,3);assert.ok(combatView(copy(c)).requests[0].specials.some(s=>s.key==='mega'));
 c=playCpu(copy(c),mega);assert.equal(c.teams[0][0].mega,true);assert.equal(c.adventureMegaPowerV1.trainers.p1.active.remaining,2);
});

test('switching pauses power, lets the replacement charge, and prevents a second simultaneous Mega',()=>{
 let c=ready(createZAAbilityCombat([mon(6,'p','charizarditex'),mon(9,'bench','blastoisinite')],[mon(143,'foe')]));c=playCpu(c,mega);
 c=playCpu(c,{type:'switch',slot:c.requests[0].switches.find(s=>s.index===1).slot});assert.equal(c.adventureMegaPowerV1.trainers.p1.active.remaining,2);
 for(let i=0;i<3;i++)c=playCpu(copy(c),splash);assert.equal(c.adventureMegaPowerV1.trainers.p1.active.remaining,2);assert.equal(c.adventurePlusGaugeV1.charge,3);assert.equal(c.requests[0].specials.some(s=>s.key==='mega'),false);assert.throws(()=>playCpu(c,mega));
 c=playCpu(c,{type:'switch',slot:c.requests[0].switches.find(s=>s.index===0).slot});assert.equal(c.adventureMegaPowerV1.trainers.p1.active.remaining,1);
 c=playCpu(copy(c),splash);assert.equal(c.teams[0][0].mega,false);assert.equal(c.adventurePlusGaugeV1.charge,3);assert.ok(c.requests[0].specials.some(s=>s.key==='mega'));c=playCpu(c,mega);assert.equal(c.teams[0][0].mega,true);assert.equal(c.adventurePlusGaugeV1.charge,0);
});

test('opponent Mega expires and recharges independently; fixed Mega bosses do not regress',()=>{
 let c=ready(createZAAbilityCombat([mon(143,'p')],[mon(6,'foe','charizarditex')]));
 for(let i=0;i<3;i++)c=playCpu(copy(c),splash);assert.equal(c.teams[1][0].mega,false);assert.equal(c.adventureMegaPowerV1.trainers.p2.charge,0);
 for(let i=0;i<3;i++)c=playCpu(copy(c),splash);assert.equal(c.adventureMegaPowerV1.trainers.p2.charge,3);
 c=playCpu(c,splash);assert.equal(c.teams[1][0].mega,true);
 let fixed=ready(createZAAbilityCombat([mon(143,'p')],[mon(10034,'boss')]));for(let i=0;i<5;i++)fixed=playCpu(fixed,splash);assert.equal(fixed.teams[1][0].mega,true);assert.equal(fixed.adventureMegaPowerV1.trainers.p2.active,null);
});

test('companion multi preserves independent owner countdown and restores player requests',()=>{
 let c=ready({...createMission10DoubleSnapshot([mon(6,'p','charizarditex')],[mon(9,'ally','blastoisinite')],[mon(143,'f1'),mon(143,'f2')]),adventureCompanionMegaV1:true});
 const owners=copy(c.owners);c=playMission10MultiTurn(c,mega);assert.equal(c.teams[0][0].mega,true);assert.equal(c.teams[2][0].mega,true);
 for(let i=0;i<2;i++)c=playMission10MultiTurn(copy(c),splash);
 assert.equal(c.teams[0][0].mega,false);assert.equal(c.teams[2][0].mega,false);assert.equal(c.adventurePlusGaugeV1.charge,0);assert.deepEqual(c.owners,owners);
 for(let i=0;i<3;i++)c=playMission10MultiTurn(copy(c),splash);
 assert.ok(mission10MultiView(copy(c)).requests[0].specials.some(s=>s.key==='mega'));
 c=playMission10MultiTurn(c,mega);assert.equal(c.teams[0][0].mega,true);assert.equal(c.teams[2][0].mega,true);
});

test('triple owners can each recharge and Mega again without transferring Pokémon',()=>{
 let c=ready(createMission37TripleSnapshot([mon(6,'p','charizarditex')],[mon(9,'ally1','blastoisinite')],[mon(3,'ally2','venusaurite')],[mon(143,'f1'),mon(143,'f2'),mon(143,'f3')]));const owners=copy(c.owners);
 c=playMission37TriplePrototype(c,mega);assert.deepEqual(c.megaUsed,[true,true,true]);
 for(let i=0;i<2;i++)c=playMission37TriplePrototype(copy(c),splash);assert.deepEqual(c.megaUsed,[false,false,false]);assert.equal(c.adventurePlusGaugeV1.charge,0);assert.deepEqual(c.owners,owners);assert.ok(c.teams[0].every(m=>!m.mega));
 for(let i=0;i<3;i++)c=playMission37TriplePrototype(copy(c),splash);assert.ok(mission37TripleView(copy(c)).requests[0].specials.some(s=>s.key==='mega'));
 c=playMission37TriplePrototype(c,mega);assert.deepEqual(c.megaUsed,[true,true,true]);assert.deepEqual(c.owners,owners);
});

test('old snapshots and generic Rogue engine keep unlimited Mega and once-per-battle rules',()=>{
 for(const fresh of [createCombat([mon(6,'p','charizarditex')],[mon(143,'f')]),createZAAbilityCombat([mon(6,'p','charizarditex')],[mon(143,'f')])]){
  delete fresh.adventureMegaPowerV1;let c={...fresh,adventurePlusGaugeV1:{charge:3,max:3},disableCpuTera:true};c=playCpu(c,mega);for(let i=0;i<4;i++)c=playCpu(copy(c),splash);assert.equal(c.teams[0][0].mega,true);assert.equal(c.adventureMegaPowerV1,undefined);
 }
});

test('winning Mega final hit stays attributable even on the final power turn',()=>{
 let c=ready(createZAAbilityCombat([{...mon(6,'p','charizarditex'),moves:['튀어오르기','화염방사']}],[mon(143,'f')]));c=playCpu(c,mega);c=playCpu(c,splash);
 c.snapshot.sides[1].pokemon[0].hp=1;c.teams[1][0].hp=1;
 c=playCpu(c,{type:'move',move:'flamethrower'});assert.equal(c.ended,true);assert.equal(c.winner,0);assert.equal(asamiMegaFinalHit(c),true);assert.equal(c.teams[0][0].mega,true);
});

test('item turns spend power, forced switches and fainted restoration do not heal the user',()=>{
 const p={...mon(6,'p','charizarditex'),hp:15};let c=ready(createZAAbilityCombat([p],[mon(143,'f')]));c=playCpu(c,mega);
 c=playCpu(copy(c),{type:'item',item:'potion'});assert.equal(c.adventureMegaPowerV1.trainers.p1.active.remaining,1);const hp=c.teams[0][0].hp;
 c=playCpu(c,splash);assert.equal(c.teams[0][0].hp,hp);assert.equal(c.teams[0][0].mega,false);
 let ko=ready(createZAAbilityCombat([{...mon(6,'p','charizarditex'),moves:['튀어오르기','자폭']},mon(143,'bench')],[{...makeMon(143,100),boxId:'f',moves:['튀어오르기'],pp:{}}]));ko=playCpu(ko,mega);ko=playCpu(ko,{type:'move',move:'selfdestruct'});
 assert.equal(ko.teams[0][0].hp,0);assert.equal(ko.requests[0].kind,'switch');
 ko=playCpu(copy(ko),{type:'switch',slot:ko.requests[0].switches[0].slot});assert.equal(ko.teams[0][0].hp,0);assert.equal(ko.teams[0][0].mega,false);assert.equal(actor(ko,'p').ability,'noability');assert.equal(ko.adventureMegaPowerV1.trainers.p1.active,null);
});

test('pre-rule multi and triple snapshots keep unlimited transformations after reconnect',()=>{
 const p=mon(6,'p','charizarditex'),a=mon(9,'a','blastoisinite'),z=mon(3,'z','venusaurite'),foes=[mon(143,'f1'),mon(143,'f2'),mon(143,'f3')];
 for(const [initial,play] of [[{...createMission10DoubleSnapshot([p],[a],foes.slice(0,2)),adventureCompanionMegaV1:true},playMission10MultiTurn],[createMission37TripleSnapshot([p],[a],[z],foes),playMission37TriplePrototype]]){
  delete initial.adventureMegaPowerV1;let c={...initial,adventurePlusGaugeV1:{charge:3,max:3}};c=play(c,mega);for(let i=0;i<4;i++)c=play(copy(c),splash);assert.equal(c.teams[0][0].mega,true);assert.equal(c.adventureMegaPowerV1,undefined);
 }
});

test('power installation and finish preserve a partially submitted multi-side choice',async()=>{
 const {installAdventureMegaPower}=await import('../lib/cloud-adventure/adventure-mega-power.mjs');
 const c=ready(createMission10DoubleSnapshot([mon(6,'p','charizarditex')],[mon(9,'a','blastoisinite')],[mon(143,'f1'),mon(143,'f2')])),b=Battle.fromJSON(c.snapshot);
 assert.equal(b.choose('p2','move splash'),true);const pending=b.p2.choice.actions.map(a=>({choice:a.choice,moveid:a.moveid}));
 const power=installAdventureMegaPower(b,c);assert.deepEqual(b.p2.choice.actions.map(a=>({choice:a.choice,moveid:a.moveid})),pending);power.finish();assert.deepEqual(b.p2.choice.actions.map(a=>({choice:a.choice,moveid:a.moveid})),pending);
 const saved={...c,snapshot:b.toJSON(),adventureMegaPowerV1:power.state};saved.snapshot.formatid=c.snapshot.formatid;
 const next=playMission10MultiTurn(copy(saved),mega);assert.equal(next.teams[0][0].mega,true);assert.equal(next.adventureMegaPowerV1.trainers.p1.active.remaining,2);assert.equal(Battle.fromJSON(next.snapshot).turn,2);
});
