import test from 'node:test';
import assert from 'node:assert/strict';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';

test('TM094 checks base species, reviewed forms, ownership and species identity',()=>{
 const bag={'za-tm094':1},can=mon=>canLearnStoryTm(bag,{moves:[],...mon},'za-tm094');
 for(const id of [142,149,227,325,326,384,449,450,666,780,973])assert.equal(can({id,speciesId:id}),true);
 for(const [id,speciesId] of [[30086,666],[30162,666],[10042,142],[10284,227]])assert.equal(can({id,speciesId}),true);
 assert.equal(can({id:30086,speciesId:1}),false);
 assert.equal(can({id:1,speciesId:1}),false);
 assert.equal(can({id:10243,speciesId:713}),false);
 assert.equal(canLearnStoryTm({}, {id:325,speciesId:325,moves:[]},'za-tm094'),false);
 assert.equal(can({id:325,speciesId:325,moves:['날려버리기']}),false);
});
