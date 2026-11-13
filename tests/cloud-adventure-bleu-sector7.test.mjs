import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Bleu Sector 7 connects the park south gate, Sector 5, and Vernal Avenue',()=>{
 const city={area:3,district:'lumiose-bleu-sector7',interior:null,x:16,y:1,zaRoyaleRank:'F',teamIds:['kept']};
 assert.equal(stepField(city,'up').blocked,true);
 const park=stepField({...city,zaRoyaleRank:'E'},'up');assert.deepEqual([park.district,park.x,park.y],['lumiose-zone12',20,15]);
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

test('Bleu Sector 7 scaffold reaches a distinct rooftop and preserves ground saves',()=>{
 const ground={area:3,district:'lumiose-bleu-sector7',interior:null,x:9,y:6,facing:'up',teamIds:['kept']};
 assert.equal(fieldMap(ground)[5][9],'l');assert.ok(fieldPath(fieldMap(ground),ground,{x:16,y:1}).length);
 const old=restoreAdventurePosition(storeAdventurePosition({...ground,x:9,y:5},82),82);assert.deepEqual([old.x,old.y,old.zaBleu7Upper],[9,5,undefined]);
 const roof={...ground,x:5,y:9,zaBleu7Upper:true},map=fieldMap(roof);assert.equal(map[10][5],'l');assert.ok(fieldPath(map,roof,{x:15,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(roof,83),83);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaBleu7Upper,saved.teamIds],[ground.district,5,9,true,['kept']]);assert.equal(restoreAdventurePosition(storeAdventurePosition(roof,83),84).district,null);
});
