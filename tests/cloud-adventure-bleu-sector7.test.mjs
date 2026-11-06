import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Bleu Sector 7 connects the park south gate, Sector 5, and Vernal Avenue',()=>{
 const city={area:3,district:'lumiose-bleu-sector7',interior:null,x:16,y:1,zaRoyaleRank:'F',teamIds:['kept']};
 assert.equal(stepField(city,'up').blocked,true);
 const park=stepField({...city,zaRoyaleRank:'E'},'up');assert.deepEqual([park.district,park.x,park.y],['lumiose-zone12',12,15]);
 assert.equal(stepField({...city,...park},'down').district,'lumiose-bleu-sector7');
 assert.ok(fieldPath(fieldMap(city),city,{x:1,y:5}).length);
 assert.ok(fieldPath(fieldMap(city),city,{x:21,y:8}).length);
 const west=stepField({...city,x:1,y:5},'left');assert.equal(west.district,'lumiose-bleu-sector5');
 assert.equal(stepField({...city,...west},'down').district,'lumiose-bleu-sector7');
 const east=stepField({...city,x:21,y:8},'right');assert.equal(east.district,'lumiose-vernal');
 assert.equal(stepField({...city,...east},'left').district,'lumiose-bleu-sector7');
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,x:10,y:8},8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-sector7',10,8,['kept']]);
 const legacy={...city,district:'lumiose-vernal',x:1,y:8};assert.equal(stepField(legacy,'left').district,'lumiose');
});
