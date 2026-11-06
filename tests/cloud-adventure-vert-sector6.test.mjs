import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Vert Sector 6 joins South Boulevard to the north entrance of Zone 17',()=>{
 const boulevard={area:3,district:'lumiose-south-boulevard',interior:null,x:20,y:1,zaRoyaleRank:'F',teamIds:['kept']};
 const v6=stepField(boulevard,'up');assert.deepEqual([v6.district,v6.x,v6.y],['lumiose-vert-sector6',1,8]);
 assert.equal(stepField({...boulevard,...v6},'left').district,'lumiose-south-boulevard');
 assert.ok(fieldPath(fieldMap({...boulevard,...v6}),v6,{x:11,y:15}).length);
 assert.equal(stepField({...boulevard,...v6,x:11,y:15},'down').blocked,true);
 const z=stepField({...boulevard,...v6,x:11,y:15,zaRoyaleRank:'C'},'down');assert.deepEqual([z.district,z.x,z.y],['lumiose-zone17',11,1]);
 assert.equal(stepField({...boulevard,...z},'up').district,'lumiose-vert-sector6');
 const saved=restoreAdventurePosition(storeAdventurePosition({...boulevard,...v6,x:11,y:8},9),9);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector6',11,8,['kept']]);
 assert.equal(stepField({...boulevard,district:'lumiose-zone17',x:11,y:15},'down').district,'lumiose-vert2');
});
