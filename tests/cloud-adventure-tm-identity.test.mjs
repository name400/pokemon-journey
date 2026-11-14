import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {canLearnResearchTm} from '../lib/cloud-adventure/adventure-research.mjs';

test('story and research TMs reject contradictory species or form without rewriting records',()=>{
 const bag={'za-tm085':1},world={zaResearchRewards:[24]},base={...makeMon(25,20),moves:['몸통박치기']};
 assert.equal(canLearnStoryTm(bag,base,'za-tm085'),true);assert.equal(canLearnResearchTm(world,base,24),true);
 for(const patch of [{formId:10205},{formId:{version:2}},{speciesId:26}]){const mon={...base,...patch},saved=structuredClone(mon);assert.equal(canLearnStoryTm(bag,mon,'za-tm085'),false);assert.equal(canLearnResearchTm(world,mon,24),false);assert.deepEqual(mon,saved);}
 const legacy={...base};delete legacy.formId;assert.equal(canLearnStoryTm(bag,legacy,'za-tm085'),true);assert.equal(canLearnResearchTm(world,legacy,24),true);
 const alola={...makeMon(10100,20),moves:['몸통박치기']};assert.equal(canLearnStoryTm(bag,alola,'za-tm085'),true);assert.equal(canLearnStoryTm(bag,{...alola,formId:alola.speciesId},'za-tm085'),false);
});
