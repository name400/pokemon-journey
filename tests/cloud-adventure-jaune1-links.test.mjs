import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('building-free Jaune 1 connects four adjacent streets and restores saves',()=>{
 const s={area:3,district:'lumiose-jaune-sector1',interior:null,x:11,y:8,teamIds:['kept'],steps:42,zaRoyaleRank:'W'};
 const map=fieldMap(s);for(let y=1;y<16;y++)for(let x=1;x<22;x++)assert.notEqual(map[y][x],'#');
 for(const [x,y,dir,district,tx,ty,back] of [[21,8,'right','lumiose-mission12-jaune3',1,10,'left'],[11,1,'up','lumiose-hibernal-approach',21,12,'right'],[1,8,'left','lumiose-centrico-route',21,4,'right'],[11,15,'down','lumiose-jaune-street',2,1,'up']]){
  assert.ok(fieldPath(map,s,{x,y}).length);const next=stepField({...s,x,y},dir);assert.deepEqual([next.district,next.x,next.y],[district,tx,ty]);assert.equal(stepField({...s,...next},back).district,s.district);
 }
 const saved=storeAdventurePosition(s,72),restored=restoreAdventurePosition(saved,72);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[s.district,11,8,['kept'],42]);
 assert.equal(stepField({...s,district:'lumiose-mission12-jaune3',zaMission12Layer:'roof',x:1,y:10},'left').transitioned,undefined);
 assert.equal(stepField({...s,district:'lumiose-jaune-street',x:11,y:1},'up').blocked,true,'Zone 8 remains locked');
});
