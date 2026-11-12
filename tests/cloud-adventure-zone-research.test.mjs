import test from 'node:test';
import assert from 'node:assert/strict';
import {LATER_ZONE_SPECIES,laterZoneResearch} from '../lib/cloud-adventure/adventure-zone-research.mjs';
import {researchSummary,researchActivityCount,recordResearchActivity} from '../lib/cloud-adventure/adventure-research.mjs';

test('later zone tasks require every documented species once, never optional alpha records',()=>{
 const expected=[7,7,7,6,6,7,6,8,6,7,7,7,6,6,7,15];assert.deepEqual(Object.values(LATER_ZONE_SPECIES).map(a=>a.length),expected);
 for(const [key,ids] of Object.entries(LATER_ZONE_SPECIES)){
  const zone=Number(key),partial={adventureDexSpecies:[...ids.slice(0,-1),ids[0],9999]};let row=laterZoneResearch(partial).find(x=>x.zone===zone);assert.equal(row.count,ids.length-1);assert.equal(row.points,0);
  const before=researchSummary(partial).points;partial.adventureDexSpecies.push(ids.at(-1));row=laterZoneResearch(partial).find(x=>x.zone===zone);assert.equal(row.count,ids.length);assert.equal(row.points,1000);assert.ok(researchSummary(partial).points>=before+1000);
 }
});
test('anomalies and three activities count once and preserve provable legacy fossil progress',()=>{
 const s={zaMission40Anomalies:['steelix','steelix','gallade']};const before=researchSummary(s).points;s.zaMission40Anomalies.push('pangoro');assert.equal(researchSummary(s).points,before+1000);
 const legacy={zaSide27Complete:true};assert.equal(researchActivityCount(legacy,'fossil'),1);recordResearchActivity(legacy,'fossil');assert.equal(researchActivityCount(legacy,'fossil'),2);recordResearchActivity(legacy,'fossil');recordResearchActivity(legacy,'fossil');assert.equal(researchActivityCount(legacy,'fossil'),3);assert.equal(researchSummary(legacy).points,500);
 for(const key of ['cafe','bench'])for(let i=0;i<4;i++)recordResearchActivity(legacy,key);assert.equal(researchSummary(legacy).points,1500);assert.equal(researchActivityCount(legacy,'bench'),3);
});
