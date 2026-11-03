import test from 'node:test';
import assert from 'node:assert/strict';
import {researchTrainerWins,researchTrainerProgress,recordResearchTrainerWin} from '../lib/adventure-research.mjs';

test('trainer research counts new wins and awards documented milestone points once',()=>{
 const s={};assert.equal(researchTrainerWins(s),0);
 for(let i=1;i<=5;i++)assert.equal(recordResearchTrainerWin(s),i===5);
 assert.deepEqual(researchTrainerProgress(s),{wins:5,completed:1,points:200,next:10});
 assert.deepEqual(researchTrainerProgress({zaResearchTrainerWins:100}),{wins:100,completed:13,points:2600,next:500});
 assert.deepEqual(researchTrainerProgress({zaResearchTrainerWins:500}),{wins:500,completed:14,points:3100,next:1000});
 assert.deepEqual(researchTrainerProgress({zaResearchTrainerWins:1000}),{wins:1000,completed:15,points:5100,next:null});
 assert.equal(researchTrainerWins({zaResearchTrainerWins:-2}),0);assert.equal(researchTrainerWins({zaResearchTrainerWins:1.5}),0);
});

test('capture types, evolution milestones and level thresholds combine without double counting',async()=>{
 const {recordResearchCapture,researchCaptureProgress,recordResearchEvolution,researchEvolutionProgress,researchSummary}=await import('../lib/adventure-research.mjs');
 const s={};for(let i=0;i<3;i++)recordResearchCapture(s,['풀','독','풀']);
 assert.equal(researchCaptureProgress(s).find(x=>x.type==='풀').count,3);assert.equal(researchCaptureProgress(s).find(x=>x.type==='독').points,300);
 assert.deepEqual(researchSummary(s),{points:600,level:3,next:1400});
 recordResearchEvolution(s,true);recordResearchEvolution(s,false);recordResearchEvolution(s,false);
 assert.equal(researchEvolutionProgress(s).all.points,500);assert.equal(researchEvolutionProgress(s).item.points,500);
 assert.deepEqual(researchSummary(s),{points:1600,level:4,next:2400});
 assert.deepEqual(researchSummary({}),{points:0,level:1,next:100});
});
