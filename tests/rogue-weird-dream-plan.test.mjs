import test from 'node:test';
import assert from 'node:assert/strict';
import {planWeirdDreamSpecies,WEIRD_DREAM_EXCLUDED_SPECIES} from '../lib/rogue-weird-dream.mjs';
function generator(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('weird dream avoids party, exclusions and repeated species while preserving order',()=>{
 const party=[{key:'a',speciesId:1,baseTotal:440},{key:'b',speciesId:2,baseTotal:460},{key:'c',speciesId:3,baseTotal:480}],pool=Array.from({length:140},(_,i)=>({speciesId:i+1,baseTotal:500+i}));
 for(let seed=1;seed<=100;seed++){const plan=planWeirdDreamSpecies(party,pool,[10,11,12],generator(seed));assert.deepEqual(plan.map(p=>p.key),['a','b','c']);assert.equal(new Set(plan.map(p=>p.speciesId)).size,3);assert.ok(plan.every(p=>![1,2,3,10,11,12].includes(p.speciesId)));const totals=plan.map(p=>pool.find(s=>s.speciesId===p.speciesId).baseTotal);assert.ok(totals.filter(n=>n>600).length<=1);assert.ok(totals.filter(n=>n>=570&&n<=600).length<=1);}
 assert.ok(WEIRD_DREAM_EXCLUDED_SPECIES.includes('ETERNATUS'));assert.throws(()=>planWeirdDreamSpecies(party,pool.slice(0,10),[],generator(2)));
});
test('refusal lowers levels and resets relative experience without mutating the old party',async()=>{
 const {lowerWeirdDreamPartyLevels}=await import('../lib/rogue-weird-dream.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');
 const party=[makeReferenceMon(151,101,{boxId:'one',moves:['Tackle']}),makeReferenceMon(4,10,{boxId:'two',moves:['Tackle']})];party[0].experience=123;party[0].hp=7;party[0].status='poison';party[1].hp=0;const saved=structuredClone(party),next=lowerWeirdDreamPartyLevels(party);
 assert.deepEqual(party,saved);assert.deepEqual(next.map(m=>m.level),[91,9]);assert.deepEqual(next.map(m=>m.experience),[0,0]);assert.equal(next[0].hp,Math.min(7,next[0].maxHp));assert.equal(next[0].status,'poison');assert.equal(next[1].hp,0);assert.deepEqual(next.map(m=>m.boxId),['one','two']);
 assert.throws(()=>lowerWeirdDreamPartyLevels([{...party[0],dynamaxed:true}]));
});
test('real source catalog produces valid plans with all excluded names resolved',async()=>{
 const {rogueSpecies,rogueReferenceData}=await import('../lib/rogue-reference.mjs');
 const excluded=WEIRD_DREAM_EXCLUDED_SPECIES.map(name=>rogueReferenceData.enums.SpeciesId[name]);assert.ok(excluded.every(Number.isInteger));
 const pool=[...rogueSpecies.values()].map(s=>({speciesId:s.sourceId,baseTotal:s.baseTotal}));
 const party=[1,4,7,25,151,448].map((id,index)=>({key:String(index),speciesId:id,baseTotal:rogueSpecies.get(id).baseTotal}));
 for(let seed=1;seed<=50;seed++){const choices=planWeirdDreamSpecies(party,pool,excluded,generator(seed));assert.equal(choices.length,party.length);assert.ok(choices.every(x=>!excluded.includes(x.speciesId)));}
});
