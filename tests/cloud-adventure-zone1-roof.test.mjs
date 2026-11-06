import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 1 rock and rooftop ladder preserve the old ground route and saved roof state',()=>{
 const ground={area:3,district:'lumiose-zone1',interior:null,x:1,y:3,facing:'left',teamIds:['kept']};
 assert.equal(fieldDialogue(ground).action,'zone1RoofRock');
 assert.equal(stepField(ground,'left').blocked,true);
 assert.equal(fieldDialogue({...ground,zaZone1RoofRockCleared:true}).action,'zone1RoofLadder');
 const roof={...ground,district:'lumiose-zone1-roof',x:2,y:9,facing:'down',zaZone1RoofRockCleared:true};
 assert.equal(fieldDialogue(roof).action,'zone1RoofLadder');
 assert.ok(fieldPath(fieldMap(roof),roof,{x:20,y:6}).length);
 assert.equal(fieldDialogue({...roof,x:20,y:6,facing:'up'}).action,'zone1RoofPearl');
 const loaded=restoreAdventurePosition(storeAdventurePosition({...roof,x:20,y:6,zaZone1RoofPearl:true},52),52);
 assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.teamIds,loaded.zaZone1RoofPearl],['lumiose-zone1-roof',20,6,['kept'],true]);
 assert.notEqual(fieldMap(loaded)[5][20],'k');
 const old=restoreAdventurePosition(storeAdventurePosition({...ground,x:1,y:3},53),53);
 assert.deepEqual([old.district,old.x,old.y,old.teamIds],['lumiose-zone1',1,3,['kept']]);
});


test('Alpha Pidgey appears on the roof after the three requests and stays spent on reload',()=>{
 const roof={area:3,district:'lumiose-zone1-roof',interior:null,x:18,y:6,facing:'up',zaBunnelbyQuest:3,zaTradeQuest:2,zaSableyeQuest:3,teamIds:['kept']};
 assert.notEqual(fieldMap({...roof,zaTradeQuest:1})[5][18],'p');
 assert.equal(fieldMap(roof)[5][18],'p');assert.equal(fieldDialogue(roof).action,'zone1RoofAlpha');
 const loaded=restoreAdventurePosition(storeAdventurePosition({...roof,zaZone1RoofAlphaSpent:true},54),54);
 assert.equal(loaded.zaZone1RoofAlphaSpent,true);assert.notEqual(fieldMap(loaded)[5][18],'p');
});

test('Zone 1 courtyard links the rooftop drop and street while preserving location',()=>{
 const roof={area:3,district:'lumiose-zone1-roof',interior:null,x:4,y:5,facing:'up',teamIds:['kept']};
 assert.equal(fieldDialogue(roof).action,'zone1CourtyardDrop');
 const yard={...roof,district:'lumiose-zone1-courtyard',x:4,y:5,facing:'down'};
 assert.ok(fieldPath(fieldMap(yard),yard,{x:21,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(yard,55),55);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone1-courtyard',4,5,['kept']]);
 const road=stepField({...saved,x:21,y:8},'right');assert.deepEqual([road.district,road.x,road.y],['lumiose-vernal',1,10]);
 const back=stepField({...saved,...road},'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-zone1-courtyard',21,8]);
});

test('Zone 1 pond safely relocates older saves and rooftop TM remains collected',()=>{
 const ground={area:3,district:'lumiose-zone1',interior:null,x:3,y:2,facing:'down',teamIds:['kept']};
 const old=storeAdventurePosition(ground,56);delete old.districtPosition.zone1Layout;
 const loaded=restoreAdventurePosition(old,56);
 assert.equal(loaded.district,'lumiose-zone1');assert.deepEqual(loaded.teamIds,['kept']);assert.notEqual(fieldMap(loaded)[loaded.y][loaded.x],'~');
 assert.equal(stepField({...ground,x:3,y:1},'down').blocked,true);
 const roof={...ground,district:'lumiose-zone1-roof',x:7,y:7,facing:'down'};
 assert.equal(fieldDialogue(roof).action,'zone1RoofTM103');assert.equal(fieldMap({...roof,zaZone1Tm103:true})[8][7],'.');
});
