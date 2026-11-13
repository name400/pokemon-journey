import test from 'node:test';
import assert from 'node:assert/strict';
import {LATER_ZONE_SPECIES,laterZoneResearch} from '../lib/cloud-adventure/adventure-zone-research.mjs';
import {researchSummary,researchActivityCount,recordResearchActivity,recordResearchTrainerWin,researchTrainerProgress} from '../lib/cloud-adventure/adventure-research.mjs';
import {RANK_B_ROUNDS} from '../lib/cloud-adventure/adventure-rank-b.mjs';

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

test('trainer battle research does not count scripted wild and simulated encounters',()=>{
 const s={zaResearchTrainerWins:4};
 for(const id of ['mission10-guard','mission11-slowbro','mission18-banette','mission29-venusaur','mission30-round-3','mission34-starmie','mission35-aegislash','side117-pangoro','side92-beldum','mission37-wave-2','mission41-sim-0','mission42-form-2','rogue-rematch-slowbro']){assert.equal(recordResearchTrainerWin(s,id),false,id);assert.equal(s.zaResearchTrainerWins,4,id);}
 assert.equal(recordResearchTrainerWin(s,'side117-josee'),true);assert.deepEqual(researchTrainerProgress(s),{wins:5,completed:1,points:200,next:10});
 assert.equal(recordResearchTrainerWin(s,'mission34-philippe'),false);assert.equal(s.zaResearchTrainerWins,6);
});

test('Rank B tournament counts its trainers but not the interrupting Zygarde, including after reload',()=>{
 assert.deepEqual(RANK_B_ROUNDS.map(round=>round.name),['Canari','Ivor','Corbeau','지가르데','Jacinthe']);
 let s={zaResearchTrainerWins:1};
 for(const id of ['mission30-round-0','mission30-round-1','mission30-round-2'])recordResearchTrainerWin(s,id);
 s=JSON.parse(JSON.stringify(s));
 const before=researchTrainerProgress(s);assert.equal(before.wins,4);
 assert.equal(recordResearchTrainerWin(s,'mission30-round-3'),false);
 assert.deepEqual(researchTrainerProgress(s),before);
 assert.equal(recordResearchTrainerWin(s,'mission30-round-4'),true);
 assert.deepEqual(researchTrainerProgress(s),{wins:5,completed:1,points:200,next:10});
 const legacy=JSON.parse(JSON.stringify({zaResearchTrainerWins:5}));
 assert.equal(researchTrainerProgress(legacy).wins,5);
});
