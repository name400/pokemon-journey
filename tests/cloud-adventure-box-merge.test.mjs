import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeAdventureBox} from '../lib/cloud-adventure/adventure-box-merge.mjs';
const reference=(box,patch,traded)=>{const merged=new Map(box.map(p=>[p.boxId,p]));for(const p of patch)merged.set(p.boxId,{...merged.get(p.boxId),...p});return [...merged.values()].filter(p=>p.boxId!==traded);};
test('compact box patches preserve details, order, additions and traded removals',()=>{
 const a={boxId:'a',hp:20,moves:['tackle']},b={boxId:'b',hp:30,shiny:true},box=[a,b];const patch=[{boxId:'b',hp:4},{boxId:'c',hp:5},{boxId:'c',name:'new'}];
 const after=mergeAdventureBox(box,patch,'a');assert.deepEqual(after,reference(box,patch,'a'));assert.deepEqual(box,[a,b]);assert.equal(after[0].shiny,true);assert.deepEqual(mergeAdventureBox(after,[{boxId:'b',status:'독'}]),reference(after,[{boxId:'b',status:'독'}]));
});
test('cached indices work across successive immutable patches, appends and removals',()=>{
 let actual=Array.from({length:50},(_,i)=>({boxId:`p${i}`,hp:i,custom:{keep:true}})),expected=actual;
 for(let i=0;i<120;i++){const patch=[{boxId:`p${i%50}`,hp:100+i},...(i%11===0?[{boxId:`new${i}`,hp:i}]:[])],traded=i%13===0?`p${i%50}`:undefined;actual=mergeAdventureBox(actual,patch,traded);expected=reference(expected,patch,traded);assert.deepEqual(actual,expected);}
});
test('legacy duplicate and missing identifiers retain previous Map and filter semantics',()=>{
 for(const [box,patch,traded] of [[[{boxId:'a',v:1},{boxId:'b'},{boxId:'a',v:2}],[{boxId:'a',x:3}],null],[[{v:1},{boxId:'b'}],[{v:2}],undefined],[[{boxId:'a'}],[{boxId:'b'},{boxId:'a',hp:0}],'b']])assert.deepEqual(mergeAdventureBox(box,patch,traded),reference(box,patch,traded));
});
