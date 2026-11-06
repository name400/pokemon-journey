import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,fieldMap,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Vernal Avenue connects opposite Zones 1 and 12 with a rank gate',()=>{
 const s={area:3,district:'lumiose-vernal',interior:null,x:1,y:3,facing:'left',zaRoyaleRank:'F'};
 assert.ok(fieldPath(fieldMap(s),s,{x:21,y:12}).length);assert.equal(stepField(s,'left').blocked,true);
 const z12=stepField({...s,zaRoyaleRank:'E'},'left');assert.equal(z12.district,'lumiose-zone12');assert.equal(stepField({...s,...z12},'right').district,'lumiose-vernal');
 const z1=stepField({...s,x:21,y:12},'right');assert.equal(z1.district,'lumiose-zone1');assert.equal(stepField({...s,...z1},'left').district,'lumiose-vernal');
 const restored=restoreAdventurePosition(storeAdventurePosition({...s,x:21,y:12,teamIds:['kept']},4),4);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-vernal',21,12]);assert.deepEqual(restored.teamIds,['kept']);
});
