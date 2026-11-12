import test from 'node:test';
import assert from 'node:assert/strict';
import {recordResearchTradeEvolution,researchTradeEvolutionProgress} from '../lib/cloud-adventure/adventure-research.mjs';

test('trade research only credits the actual recipient at documented milestones',()=>{
 const s={};assert.equal(recordResearchTradeEvolution(s,{},'alice'),false);assert.equal(recordResearchTradeEvolution(s,{adventureResearchTradeRecipient:'bob'},'alice'),false);assert.equal(researchTradeEvolutionProgress(s).points,0);
 for(let i=1;i<=6;i++){assert.equal(recordResearchTradeEvolution(s,{adventureResearchTradeRecipient:'alice'},'alice'),true);assert.equal(researchTradeEvolutionProgress(s).points,i>=5?6000:i>=3?4000:2000);}
 assert.equal(researchTradeEvolutionProgress(s).count,5);
});
