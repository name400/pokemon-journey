import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert 2, 4, 5 and Vert Plaza connect in both directions and retain saves',()=>{
 const start={area:3,district:'lumiose-vert2',interior:null,x:7,y:15,facing:'down',teamIds:['kept']};
 const four=stepField(start,'down');assert.deepEqual([four.district,four.x,four.y],['lumiose-vert-sector4',11,1]);
 let s={...start,...four};assert.ok(fieldPath(fieldMap(s),s,{x:21,y:8}).length);assert.equal(stepField(s,'up').district,'lumiose-vert2');
 const five=stepField({...s,x:21,y:8},'right');assert.deepEqual([five.district,five.x,five.y],['lumiose-vert-sector5',1,8]);
 s={...s,...five};assert.equal(stepField(s,'left').district,'lumiose-vert-sector4');assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:1},11),11);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,11,1,['kept']]);
 const plaza=stepField(saved,'up');assert.deepEqual([plaza.district,plaza.x,plaza.y],['lumiose-vert-plaza',15,15]);assert.equal(stepField({...saved,...plaza},'down').district,'lumiose-vert-sector5');
 assert.equal(restoreAdventurePosition(storeAdventurePosition(s,11),12).district,null);
 assert.equal(walkable(fieldMap({...start,...four})[3][3]),false);
});
