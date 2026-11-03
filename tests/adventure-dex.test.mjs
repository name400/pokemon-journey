import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureDexEntries,registerAdventureDex} from '../lib/adventure-dex.mjs';

test('adventure registration is stable, distinct and leaves unrelated progress intact',()=>{
 const s={custom:{keep:true},adventureDexSpecies:[25,1,25,'bad']};
 assert.equal(registerAdventureDex(s,2,1,0,1026,null),1);
 assert.deepEqual(adventureDexEntries(s),[1,2,25]);assert.deepEqual(s.custom,{keep:true});
 assert.equal(registerAdventureDex(s,25,2),0);assert.deepEqual(adventureDexEntries({}),[]);
});

test('verified base Lumiose entries determine research milestones, excluding later additions',async()=>{
 const {lumioseDexEntries,lumioseDexProgress}=await import('../lib/adventure-dex.mjs');
 const entries=lumioseDexEntries({});assert.equal(entries.length,232);assert.deepEqual(entries.slice(0,3).map(e=>e.speciesId),[152,153,154]);assert.equal(entries[20].speciesId,16);assert.equal(new Set(entries.map(e=>e.speciesId)).size,232);
 const ids=entries.map(e=>e.speciesId),s={adventureDexSpecies:ids.slice(0,5)};
 assert.deepEqual(lumioseDexProgress(s),{registered:5,total:230,points:100,next:10});
 s.adventureDexSpecies=ids.slice(0,10);assert.equal(lumioseDexProgress(s).points,400);
 s.adventureDexSpecies=ids.slice(0,230);assert.deepEqual(lumioseDexProgress(s),{registered:230,total:230,points:18700,next:null});
 s.adventureDexSpecies=ids;assert.equal(lumioseDexProgress(s).registered,230);assert.equal(lumioseDexProgress(s).points,18700);
 assert.deepEqual(lumioseDexProgress({adventureDexSpecies:[290,291,292]}),{registered:0,total:230,points:0,next:5});
});
