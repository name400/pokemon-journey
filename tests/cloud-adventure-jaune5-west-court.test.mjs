import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 5 west court is reachable without replacing old routes and restores safely',()=>{
 const s={area:3,district:'lumiose-jaune-sector5',interior:null,x:1,y:4,teamIds:['kept'],steps:42};
 const court=stepField(s,'left');assert.deepEqual([court.district,court.x,court.y],['lumiose-jaune5-west-court',1,8]);
 const inside={...s,...court};assert.ok(fieldPath(fieldMap(inside),inside,{x:11,y:8}).length);
 assert.equal(stepField(inside,'left').district,s.district);
 const restored=restoreAdventurePosition(storeAdventurePosition({...inside,x:11,y:8},91),91);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[inside.district,11,8,['kept'],42]);
 assert.equal(stepField({...s,x:1,y:8},'left').district,'lumiose-jaune-sector4');
 assert.equal(stepField({...s,x:1,y:12},'left').district,'lumiose-mission12-jaune3');
 assert.ok(fieldPath(fieldMap(s),{x:11,y:15},{x:12,y:8}).length);
});
