import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 7 connects both avenues while keeping gates and saved positions',()=>{
 const s={area:3,district:'lumiose-jaune-sector7',interior:null,x:1,y:12,zaRoyaleRank:'W',teamIds:['kept'],steps:42};
 const west=stepField(s,'left');assert.deepEqual([west.district,west.x,west.y],['lumiose-hibernal-approach',21,10]);
 const hibernal={...s,...west};assert.equal(stepField(hibernal,'right').district,s.district);
 assert.ok(fieldPath(fieldMap(s),s,{x:21,y:8}).length);
 const east=stepField({...s,x:21,y:8},'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-north-boulevard',17,15]);
 const boulevard={...s,...east};assert.equal(stepField(boulevard,'down').district,s.district);
 assert.equal(stepField({...s,x:11,y:1},'up').blocked,true,'Zone 15 remains locked');
 assert.equal(stepField({...boulevard,x:19,y:1},'up').blocked,true,'Boulevard gate remains locked');
 assert.equal(stepField({...s,x:19,y:15},'down').district,'lumiose-jaune-sector8');
 for(const world of [s,hibernal,boulevard]){const restored=restoreAdventurePosition(storeAdventurePosition(world,51),51);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[world.district,world.x,world.y,['kept'],42]);}
});
