import test from 'node:test';import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';import {configure} from '../lib/pokemon-config.mjs';import {adventureEffortYield,grantAdventureEffort} from '../lib/cloud-adventure/adventure-effort.mjs';
test('species yields and power weight apply only to the holder',()=>{const pikachu=makeMon(25,5),mon={...makeMon(1,30),evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}},holder={...mon,item:'powerweight'};assert.deepEqual(adventureEffortYield(pikachu),[0,0,0,0,0,2]);assert.deepEqual(adventureEffortYield(makeMon(30001,5)),adventureEffortYield(makeMon(201,5)));assert.equal(grantAdventureEffort(mon,pikachu).evs.spe,2);assert.deepEqual(grantAdventureEffort(holder,pikachu).evs,{hp:8,atk:0,def:0,spa:0,spd:0,spe:2});assert.equal(mon.evs.spe,0);assert.equal(grantAdventureEffort({...holder,hp:0},pikachu).evs.hp,0);assert.equal(grantAdventureEffort(holder,{id:999999}),holder);});
test('stat and total limits preserve HP damage and old IVs',()=>{const foe=makeMon(25,5),base=configure({...makeMon(1,50),evs:{hp:248,atk:252,def:0,spa:0,spd:0,spe:8},item:'powerweight'},{hp:10}),next=grantAdventureEffort(base,foe);assert.equal(Object.values(next.evs).reduce((a,b)=>a+b,0),510);assert.equal(next.evs.hp,250);assert.equal(next.hp,base.hp+next.maxHp-base.maxHp);assert.deepEqual(next.ivs,base.ivs);assert.equal(grantAdventureEffort({...base,evs:{hp:-1}},foe).evs.hp,-1);});

test('ordered faint events award once to those alive at the moment of defeat',async()=>{
 const {applyAdventureBattleEffort}=await import('../lib/cloud-adventure/adventure-effort.mjs'),foe={...makeMon(25,5),boxId:'enemy'},a={...makeMon(1,30),boxId:'a',item:'powerweight'},b={...makeMon(4,30),boxId:'b'},before={adventureEffortVersion:1,teams:[[a,b],[foe]]},after={...before,teams:[[{...a,hp:0},b],[{...foe,hp:0}]],events:[{kind:'faint',side:1,boxId:'enemy',hp:0},{kind:'faint',side:0,boxId:'a',hp:0}]};
 const result=applyAdventureBattleEffort(before,after);assert.equal(result.teams[0][0].evs.hp,8);assert.equal(result.teams[0][0].evs.spe,2);assert.equal(result.teams[0][1].evs.spe,2);assert.equal(result.teams[0][0].hp,0);assert.deepEqual(result.adventureEffortFoes,['enemy']);
 const replay=applyAdventureBattleEffort(result,{...result,events:after.events});assert.deepEqual(replay.teams[0].map(m=>m.evs),result.teams[0].map(m=>m.evs));assert.equal(applyAdventureBattleEffort({...before,adventureEffortVersion:undefined},after),after);
 const firstFaints=applyAdventureBattleEffort(before,{...after,events:[{kind:'faint',side:0,boxId:'a',hp:0},{kind:'faint',side:1,boxId:'enemy',hp:0}]});assert.equal(firstFaints.teams[0][0].evs.hp,0);assert.equal(firstFaints.teams[0][1].evs.spe,2);
});

test('power weight retains the simulator speed penalty during battle',async()=>{
 const {Battle}=await import('@pkmn/sim'),{createCombat}=await import('../lib/party-battle.mjs');const player={...makeMon(25,30),boxId:'player'},foe={...makeMon(1,5),boxId:'foe'};
 const normal=Battle.fromJSON(createCombat([{...player,item:''}],[foe]).snapshot),weighted=Battle.fromJSON(createCombat([{...player,item:'powerweight'}],[foe]).snapshot);assert.equal(weighted.p1.active[0].getStat('spe'),Math.floor(normal.p1.active[0].getStat('spe')/2));
});

test('a held item changing during a turn does not receive an unverified weight bonus',async()=>{
 const {applyAdventureBattleEffort}=await import('../lib/cloud-adventure/adventure-effort.mjs'),mon={...makeMon(1,30),boxId:'p',item:'powerweight'},foe={...makeMon(25,5),boxId:'f'},before={adventureEffortVersion:1,teams:[[mon],[foe]]},after={...before,teams:[[{...mon,item:''}],[{...foe,hp:0}]],events:[{kind:'faint',side:1,boxId:'f',hp:0}]};const result=applyAdventureBattleEffort(before,after);assert.equal(result.teams[0][0].evs.hp,0);assert.equal(result.teams[0][0].evs.spe,2);
});
