import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 8 links North Boulevard and preserves the existing routes and saves',()=>{
 const s={area:3,district:'lumiose-jaune-sector8',interior:null,x:21,y:8,zaRoyaleRank:'W',teamIds:['kept'],steps:42};
 assert.ok(fieldPath(fieldMap(s),{x:15,y:1},s).length);
 const next=stepField(s,'right');assert.deepEqual([next.district,next.x,next.y],['lumiose-north-boulevard',13,15]);
 const boulevard={...s,...next};assert.equal(stepField(boulevard,'down').district,s.district);
 assert.ok(fieldPath(fieldMap(boulevard),boulevard,{x:7,y:8}).length);
 assert.equal(stepField({...s,x:11,y:1},'up').blocked,true,'Zone 19 stays locked');
 assert.equal(stepField({...boulevard,x:19,y:1},'up').blocked,true,'Zone 15 stays locked');
 assert.equal(stepField({...s,x:1,y:12},'left').district,'lumiose-jaune-sector5');
 for(const world of [s,boulevard]){const restored=restoreAdventurePosition(storeAdventurePosition(world,43),43);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[world.district,world.x,world.y,['kept'],42]);}
});
