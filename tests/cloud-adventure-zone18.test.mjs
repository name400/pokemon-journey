import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone18Map,zone18Visible,zone18Encounter} from '../lib/cloud-adventure/adventure-zone18.mjs';
test('zone eighteen gate, road and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:2,y:1,facing:'up',zaRoyaleRank:'C'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'B'},'up');assert.equal(entered.district,'lumiose-zone18');
 const s={...base,...entered,zaRoyaleRank:'B'};assert.ok(fieldPath(zone18Map(s),s,{x:7,y:8}).length);assert.equal(zone18Visible(s,'a').species,371);assert.equal(zone18Encounter(s,()=>0).speciesId,371);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:7,y:8},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone18',7,8]);assert.equal(stepField(s,'left').district,'lumiose-north-boulevard');
});
