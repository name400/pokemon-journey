import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle,Dex} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {configure,effectiveIVs} from '../lib/pokemon-config.mjs';
import {createCombat} from '../lib/party-battle.mjs';
import {hyperTrainAdventure} from '../lib/cloud-adventure/adventure-hyper-training.mjs';

test('hyper training changes calculated and battle stats without changing original IVs',()=>{
 const ivs={hp:0,atk:0,def:5,spa:10,spd:20,spe:31},mon=configure({...makeMon(1,50),ivs,boxId:'hero'});mon.hp=mon.maxHp-5;
 const a=hyperTrainAdventure(mon,'bottlecap','atk').mon;assert.deepEqual(a.ivs,ivs);assert.equal(effectiveIVs(a).atk,31);assert.ok(a.stats.atk>mon.stats.atk);assert.equal(mon.adventureHyperTrained,undefined);
 const combat=createCombat([a],[{...makeMon(4,50),boxId:'foe'}]),battle=Battle.fromJSON(combat.snapshot),p=battle.p1.pokemon[0];assert.equal(p.set.ivs.atk,31);assert.equal(p.hpType,Dex.getHiddenPower(ivs).type);assert.deepEqual(combat.teams[0][0].ivs,ivs);assert.equal(JSON.parse(JSON.stringify(combat)).teams[0][0].adventureHyperTrained.atk,true);
 const b=hyperTrainAdventure(a,'goldbottlecap').mon;assert.deepEqual(b.ivs,ivs);assert.deepEqual(Object.values(effectiveIVs(b)),[31,31,31,31,31,31]);assert.equal(b.maxHp-b.hp,5);
 assert.throws(()=>hyperTrainAdventure(b,'goldbottlecap'),/없습니다/);assert.throws(()=>hyperTrainAdventure(mon,'bottlecap','spe'),/없습니다/);assert.throws(()=>hyperTrainAdventure({...mon,level:49},'bottlecap','hp'),/50/);assert.equal(hyperTrainAdventure({...mon,hp:0},'bottlecap','hp').mon.hp,0);
});
