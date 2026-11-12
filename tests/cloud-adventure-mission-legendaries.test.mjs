import test from 'node:test';
import assert from 'node:assert/strict';
import {moves} from '../lib/game.mjs';
import {rules,statKeys} from '../lib/pokemon-config.mjs';
import {makeMissionLegendary} from '../lib/cloud-adventure/adventure-mission40-legendaries.mjs';

test('mission 40 and 41 legendaries use their fixed moves, three perfect IVs and random nature',()=>{
 for(const [id,expected] of [[716,['메가혼','문포스','우드혼','지오컨트롤']],[717,['폭풍','악의파동','사이코키네시스','데스윙']]]){
  for(const roll of [0,0.25,0.75,0.999]){
   const mon=makeMissionLegendary(id,()=>roll);
   assert.equal(mon.level,75);assert.equal(mon.shiny,false);
   assert.deepEqual(mon.moves,expected);assert.ok(mon.moves.every(move=>moves[move]));
   assert.ok(statKeys.filter(key=>mon.ivs[key]===31).length>=3);
   assert.ok(statKeys.every(key=>Number.isInteger(mon.ivs[key])&&mon.ivs[key]>=0&&mon.ivs[key]<=31));
   assert.ok(Object.hasOwn(rules.natures,mon.nature));
   assert.equal(mon.hp,mon.maxHp);assert.equal(mon.maxHp,mon.stats.hp);
  }
  assert.notEqual(makeMissionLegendary(id,()=>0).nature,makeMissionLegendary(id,()=>0.75).nature);
 }
 assert.throws(()=>makeMissionLegendary(1));
});
