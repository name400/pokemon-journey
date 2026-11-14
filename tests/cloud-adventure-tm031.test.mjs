import test from 'node:test';
import assert from 'node:assert/strict';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';

test('Reflect TM supports reviewed species and forms without inferring unknown forms',()=>{
 const bag={'za-tm031':1},can=(mon,b=bag)=>canLearnStoryTm(b,mon,'za-tm031');
 for(const id of [823,866,936,937,944,945,957,958,959,969,970])assert.equal(can({id,speciesId:id,moves:[]}),true,`${id}`);
 for(const [id,speciesId] of [[10100,26],[10168,122],[10008,479],[10009,479],[10010,479],[10011,479],[10012,479]])assert.equal(can({id,speciesId,moves:[]}),true,`${id}`);
 assert.equal(can({id:10008,speciesId:25,moves:[]}),false);
 assert.equal(can({id:99999,speciesId:479,moves:[]}),false);
 assert.equal(can({id:129,speciesId:129,moves:[]}),false);
 assert.equal(can({id:823,speciesId:823,moves:['리플렉터']}),false);
 assert.equal(can({id:823,speciesId:823,moves:[]},{}),false);
});
