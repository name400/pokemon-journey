import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('draft Rouge Plaza southeast road joins Hibernal and preserves old exits',()=>{
 const plaza={area:3,district:'lumiose-zone3',interior:null,x:21,y:12,facing:'right',teamIds:['kept'],steps:42};
 const east=stepField(plaza,'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-hibernal-approach',1,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...plaza,...east},148),148);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.steps],['lumiose-hibernal-approach',1,12,['kept'],42]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:12}).length);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-zone3',21,12]);
 const original=stepField({...plaza,x:21,y:8},'right');assert.equal(original.district,'lumiose-centrico-route');
 const lower=stepField({...plaza,x:11,y:15},'down');assert.equal(lower.district,'lumiose-centrico-route');
 const old=restoreAdventurePosition(storeAdventurePosition({...plaza,x:20,y:12},149),149);assert.deepEqual([old.x,old.y,old.teamIds],[20,12,['kept']]);
});
