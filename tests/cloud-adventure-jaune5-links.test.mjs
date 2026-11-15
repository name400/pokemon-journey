import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 5 courtyard connects Sectors 4 and 7 and restores its saved position',()=>{
 const start={area:3,district:'lumiose-jaune-sector4',interior:null,x:21,y:8,teamIds:['kept'],steps:42};
 const entry=stepField(start,'right');assert.deepEqual([entry.district,entry.x,entry.y],['lumiose-jaune-sector5',1,8]);
 const s={...start,...entry},map=fieldMap(s);assert.equal(stepField(s,'left').district,start.district);
 assert.ok(fieldPath(map,s,{x:12,y:8}).length,'courtyard must be reachable');
 assert.ok(fieldPath(map,s,{x:11,y:1}).length,'Sector 7 approach must be reachable');
 const north=stepField({...s,x:11,y:1},'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-jaune-sector7',15,15]);
 assert.equal(stepField({...s,...north},'down').district,s.district);
 assert.ok(fieldPath(map,s,{x:1,y:12}).length);
 const sector3=stepField({...s,x:1,y:12},'left');assert.deepEqual([sector3.district,sector3.x,sector3.y,sector3.zaMission12Layer],['lumiose-mission12-jaune3',21,12,'ground']);
 assert.equal(stepField({...s,...sector3},'right').district,s.district);
 assert.ok(fieldPath(map,s,{x:21,y:8}).length);
 const sector8=stepField({...s,x:21,y:8},'right');assert.deepEqual([sector8.district,sector8.x,sector8.y],['lumiose-jaune-sector8',1,12]);
 assert.equal(stepField({...s,...sector8},'left').district,s.district);
 assert.equal(stepField({...s,...sector8,x:1,y:8,zaRoyaleRank:'W'},'left').blocked,true);
 assert.equal(stepField({...s,...sector3,zaMission12Layer:'roof',x:21,y:12},'right').transitioned,undefined);
 const saved=storeAdventurePosition({...s,x:12,y:8},81),restored=restoreAdventurePosition(saved,81);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[s.district,12,8,['kept'],42]);
 assert.equal(stepField({...s,district:'lumiose-jaune-sector7',x:11,y:15},'down').district,'lumiose-jaune-sector4');
});
