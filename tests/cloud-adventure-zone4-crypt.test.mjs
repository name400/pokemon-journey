import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Zone 4 south crypt keeps exits and safely restores older saved locations',()=>{
 const z={area:3,district:'lumiose-zone4',interior:null,x:11,y:15,zaSableyeQuest:1,teamIds:['kept']};
 const map=fieldMap(z);assert.equal(map[12][14],'^');assert.equal(stepField({...z,x:13,y:12},'right').blocked,true);
 assert.ok(fieldPath(map,z,{x:18,y:6}).length);assert.equal(stepField(z,'down').district,'lumiose-rouge-north');
 const saved=restoreAdventurePosition(storeAdventurePosition({...z,x:15,y:12},73),73);
 assert.equal(saved.district,'lumiose-zone4');assert.equal(saved.zaSableyeQuest,1);assert.deepEqual(saved.teamIds,['kept']);
 assert.notEqual(fieldMap(saved)[saved.y][saved.x],'^');assert.ok(fieldPath(fieldMap(saved),saved,{x:18,y:6}).length);
});
