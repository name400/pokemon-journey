import test from 'node:test';
import assert from 'node:assert/strict';
import {CITY_AREA,CITY_WILD_AREA,CITY_WILD_IDS,GARDEN_WILD_IDS} from '../lib/adventure-city.mjs';
import {species} from '../lib/game.mjs';

test('city park encounters have unique playable ordinary forms and a valid level range',()=>{
 for(const [area,ids] of [[CITY_AREA,CITY_WILD_IDS],[CITY_WILD_AREA,GARDEN_WILD_IDS]]){
  assert.equal(new Set(ids).size,ids.length);assert.ok(ids.length>=8);
  for(const id of ids){const mon=species.find(p=>p.id===id&&p.defaultForm);assert.ok(mon,`missing city species ${id}`);assert.ok(!mon.legendary,`legendary city species ${id}`);}
  assert.ok(area.min>=1&&area.max>=area.min&&area.max<=100);
 }
 assert.notDeepEqual(CITY_WILD_IDS,GARDEN_WILD_IDS);
});
