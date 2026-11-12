import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {adventureEvResetUnlocked,resetAdventureEvs} from '../lib/cloud-adventure/adventure-ev-reset.mjs';

test('effort reset preserves damage, ownership, IVs and other Pokémon fields',()=>{
 const m=configure({...makeMon(25,50),evs:{hp:252,atk:80,def:0,spa:0,spd:0,spe:0},boxId:'owned',item:'lightball',status:'마비',pp:{thundershock:4}},{hp:40});const before=structuredClone(m),result=resetAdventureEvs(m).mon;
 assert.deepEqual(m,before);assert.deepEqual(result.evs,{hp:0,atk:0,def:0,spa:0,spd:0,spe:0});assert.deepEqual(result.ivs,m.ivs);assert.equal(result.boxId,m.boxId);assert.equal(result.item,m.item);assert.equal(result.status,m.status);assert.deepEqual(result.pp,m.pp);assert.equal(result.hp,Math.max(1,m.hp+result.maxHp-m.maxHp));
 assert.equal(resetAdventureEvs({...m,hp:0}).mon.hp,0);assert.throws(()=>resetAdventureEvs({...m,evs:{hp:-1}}));assert.throws(()=>resetAdventureEvs({...m,evs:{}}));
 assert.equal(adventureEvResetUnlocked({zaMission20Stage:14}),false);assert.equal(adventureEvResetUnlocked({zaMission20Complete:true}),true);assert.equal(adventureEvResetUnlocked({zaMission20Stage:15}),true);
});
