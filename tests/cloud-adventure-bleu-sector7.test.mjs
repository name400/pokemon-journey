import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('the western courtyard reaches Marnole and keeps center and bench positions',()=>{
 const city={area:3,district:'lumiose-bleu-sector7',interior:null,x:6,y:15,zaMission10Stage:10,zaRoyaleRank:'F',teamIds:['kept']};
 const map=fieldMap(city);
 assert.ok(fieldPath(map,city,{x:6,y:12}).length);
 assert.equal(map[11][6],'t');assert.equal(map[12][8],'^');assert.equal(map[13][8],'M');assert.equal(map[13][11],'H');
 assert.equal(fieldDialogue({...city,x:6,y:12,facing:'up'},map).action,'side28Battle');
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,x:6,y:12},116),116);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission10Stage],['lumiose-bleu-sector7',6,12,['kept'],10]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:15}).length);
 const old=restoreAdventurePosition(storeAdventurePosition({...city,x:9,y:12},116),116);
 assert.deepEqual([old.x,old.y],[9,12]);
});
test('the eastern courtyard has two walkable approaches and preserves existing services',()=>{
 const city={area:3,district:'lumiose-bleu-sector7',interior:null,x:16,y:10,zaSide45Stage:1,teamIds:['kept']};
 const map=fieldMap(city);
 for(const [x,y] of [[16,11],[15,12],[16,12],[17,12],[16,13],[16,14]])assert.equal(map[y][x],',');
 assert.ok(fieldPath(map,city,{x:16,y:15}).length);
 assert.equal(map[14][14],'j');assert.equal(map[13][11],'H');assert.equal(map[5][9],'l');
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,x:16,y:12},115),115);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaSide45Stage],['lumiose-bleu-sector7',16,12,['kept'],1]);
 assert.equal(stepField({...saved,x:16,y:13},'down').blocked,undefined);
 const old=restoreAdventurePosition(storeAdventurePosition({...city,x:11,y:13},115),115);
 assert.deepEqual([old.x,old.y,old.zaSide45Stage],[11,13,1]);
});
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

test('western courtyard stairs keep saved ground tiles and create a separate raised area',()=>{
 const ground={area:3,district:'lumiose-bleu-sector7',interior:null,x:5,y:12,facing:'down',zaMission10Stage:10,teamIds:['kept']};
 const old=restoreAdventurePosition(storeAdventurePosition(ground,204),204);assert.deepEqual([old.x,old.y,old.teamIds],[5,12,['kept']]);assert.equal(fieldMap(old)[12][5],'u');assert.equal(fieldDialogue(old).action,'bleu7WestStairs');
 const raised={...ground,district:'lumiose-bleu7-west-raised',x:7,y:11,facing:'down'},map=fieldMap(raised);assert.equal(map[12][7],'u');assert.equal(map[6][15],'i');assert.ok(fieldPath(map,raised,{x:15,y:6}).length);assert.equal(fieldDialogue(raised).action,'bleu7WestStairs');
 const saved=restoreAdventurePosition(storeAdventurePosition({...raised,zaBleu7WestRevive:true},205),205);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu7-west-raised',7,11,['kept']]);assert.equal(fieldMap(saved)[6][15],'.');
});
