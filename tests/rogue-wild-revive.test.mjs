import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,continueClassicWild,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {buyClassicService,classicServices} from '../lib/rogue-classic-services.mjs';

const lead=makeReferenceMon(151,100,{boxId:'lead',moves:['Seismic Toss'],status:'psn'}),bench={...makeReferenceMon(25,10,{boxId:'bench',moves:['Thunder Shock']}),hp:0};
const run={id:'revive-continuity',wave:1,biome:0,rng:42,party:[lead,bench],modifiers:[],tools:{},seed:'fixture',encounter:{kind:'wild'},teraCharged:false};
run.combat=createClassicCombat(run,[makeReferenceMon(19,2,{boxId:'first',moves:['Splash']})]);run.combat=playClassicCombat(run,{type:'move',move:'seismictoss'});assert.equal(run.combat.winner,0);run.party=run.combat.teams[0];
// Apply the result of a normal revive service between consecutive wild battles.
run.screen='reward';run.money=10000;const service=classicServices(run).find(item=>item.id==='revive');buyClassicService(run,{itemId:'revive',boxId:'bench',expectedPrice:service.price});const revived=run.party.find(mon=>mon.boxId==='bench'),expected=revived.hp,healed=run.party.find(mon=>mon.boxId==='lead');assert.equal(healed.status,'독');healed.hp=healed.maxHp;healed.status=null;run.wave++;
run.combat=continueClassicWild(run,[makeReferenceMon(19,2,{boxId:'second',moves:['Splash']})]);const actual=run.combat.teams[0].find(mon=>mon.boxId==='bench');assert.equal(actual.hp,expected);
const native=restoreClassicNativeBattle(run.combat,run),pokemon=native.p1.pokemon.find(p=>p.set.trainerToken==='bench');assert.equal(pokemon.hp,expected);assert.equal(pokemon.fainted,false);assert.equal(native.p1.pokemonLeft,2);assert.equal(native.p1.active[0].status,'');assert.equal(native.p1.active[0].hp,healed.maxHp);assert.ok(run.combat.requests[0].switches.some(option=>option.name===actual.name));
run.party=run.combat.teams[0];const switchSlot=run.combat.requests[0].switches.find(option=>option.name===actual.name).slot;const switched=playClassicCombat(run,{type:'switch',slot:switchSlot});assert.equal(restoreClassicNativeBattle(switched,run).p1.active[0].set.trainerToken,'bench');
console.log('A revived bench Pokémon remains alive and switchable across consecutive wild battles.');
