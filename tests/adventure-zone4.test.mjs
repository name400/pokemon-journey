import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE4_SPECIES,zone4Encounter,zone4Research} from '../lib/adventure-zone4.mjs';
import {researchSummary} from '../lib/adventure-research.mjs';

test('zone 4 research counts six documented species once, including old records',()=>{
 const s={adventureDexSpecies:ZONE4_SPECIES.slice(0,5)};
 assert.deepEqual(zone4Research(s),{count:5,total:6,points:0});
 const before=researchSummary(s).points;s.adventureDexSpecies=[...ZONE4_SPECIES,679];
 assert.deepEqual(zone4Research(s),{count:6,total:6,points:1000});
 assert.ok(researchSummary(s).points>=before+1000);
});
test('zone 4 night-only Honedge, day-only Spewpa and documented level bounds',()=>{
 const bounds={23:[8,10],92:[9,10],167:[7,8],504:[8,9],664:[9,10],679:[10,11]};
 for(const period of ['day','night'])for(let i=0;i<5;i++)for(const r of [0,.999999]){
  const values=[i/5,r],p=zone4Encounter(period,()=>values.shift()??0);
  assert.ok(ZONE4_SPECIES.includes(p.speciesId));assert.ok(p.level>=bounds[p.speciesId][0]&&p.level<=bounds[p.speciesId][1]);
  if(period==='day')assert.notEqual(p.speciesId,679);else assert.notEqual(p.speciesId,664);
 }
});
