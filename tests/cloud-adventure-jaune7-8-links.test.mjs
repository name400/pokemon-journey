import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 7 and 8 connect without changing wild-zone restrictions or saved positions',()=>{
 const s={area:3,district:'lumiose-jaune-sector7',interior:null,x:19,y:15,zaRoyaleRank:'W',teamIds:['kept'],steps:42};
 assert.ok(fieldPath(fieldMap(s),{x:1,y:8},s).length);
 const next=stepField(s,'down');assert.deepEqual([next.district,next.x,next.y],['lumiose-jaune-sector8',15,1]);
 const sector8={...s,...next};assert.equal(stepField(sector8,'up').district,s.district);
 assert.ok(fieldPath(fieldMap(sector8),sector8,{x:11,y:15}).length);
 assert.equal(stepField({...sector8,x:11,y:1},'up').blocked,true,'Zone 19 stays locked');
 assert.equal(stepField({...s,x:11,y:1},'up').blocked,true,'Zone 15 stays locked');
 assert.equal(stepField({...s,x:15,y:15},'down').district,'lumiose-jaune-sector5');
 for(const world of [s,sector8]){const restored=restoreAdventurePosition(storeAdventurePosition(world,39),39);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[world.district,world.x,world.y,['kept'],42]);}
});
