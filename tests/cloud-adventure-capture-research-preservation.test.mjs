import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordResearchCapture} from '../lib/cloud-adventure/adventure-research.mjs';

test('capture research preserves future containers and unknown per-type counters',()=>{
 for(const saved of [null,[],{version:2,counts:{비행:91}},{v:3,비행:10},'future']){
  const s={zaResearchCaptures:structuredClone(saved)};recordResearchCapture(s,['비행']);assert.deepEqual(s.zaResearchCaptures,saved);
 }
 const original={노말:51,비행:{version:2,count:99},풀:4,'future-type':8};const s={zaResearchCaptures:original};recordResearchCapture(s,['노말','비행','풀','풀']);
 assert.deepEqual(s.zaResearchCaptures,{...original,풀:5});assert.equal(original.풀,4);
 const old={};recordResearchCapture(old,['노말','비행']);assert.deepEqual(old.zaResearchCaptures,{노말:1,비행:1});
});
