import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureDexEntries,registerAdventureDex} from '../lib/adventure-dex.mjs';

test('adventure registration is stable, distinct and leaves unrelated progress intact',()=>{
 const s={custom:{keep:true},adventureDexSpecies:[25,1,25,'bad']};
 assert.equal(registerAdventureDex(s,2,1,0,1026,null),1);
 assert.deepEqual(adventureDexEntries(s),[1,2,25]);assert.deepEqual(s.custom,{keep:true});
 assert.equal(registerAdventureDex(s,25,2),0);assert.deepEqual(adventureDexEntries({}),[]);
});
