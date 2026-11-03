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
