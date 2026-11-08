import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 1 street is non-grass while neighboring grass and old positions remain intact',()=>{
 const base={area:3,district:'lumiose-zone1',interior:null,x:6,y:8,facing:'right',teamIds:['kept'],steps:42};
 const map=fieldMap(base);
 for(let x=6;x<=16;x++){
  assert.equal(map[8][x],',');assert.equal(map[7][x],'g');assert.equal(map[9][x],'g');
  const saved=storeAdventurePosition({...base,x},61);delete saved.districtPosition.zone1Layout;
  const restored=restoreAdventurePosition(saved,61);
  assert.deepEqual([restored.district,restored.x,restored.y,restored.steps,restored.teamIds],['lumiose-zone1',x,8,42,['kept']]);
 }
 assert.ok(fieldPath(map,{x:1,y:8},{x:21,y:8}).length);
 assert.equal(stepField({...base,x:6,y:7},'down').tile,',');
 assert.equal(stepField(base,'up').tile,'g');
});

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

test('Zone 1 north gate links Vert Sector 9 to Vernal and the courtyard',()=>{
 const ground={area:3,district:'lumiose-zone1',interior:null,x:11,y:1,facing:'up',teamIds:['kept']};
 const north=stepField(ground,'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-vert-sector9',11,15]);
 const sector={...ground,...north};assert.ok(fieldPath(fieldMap(sector),sector,{x:1,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(sector,57),57);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector9',11,15,['kept']]);
 assert.deepEqual([stepField(saved,'down').district,stepField(saved,'down').x],['lumiose-zone1',11]);
 const vernal=stepField({...saved,x:1,y:8},'left');assert.deepEqual([vernal.district,vernal.x,vernal.y],['lumiose-vernal',21,10]);
 assert.equal(stepField({...saved,...vernal},'right').district,'lumiose-vert-sector9');
 assert.ok(fieldPath(fieldMap({...saved,...vernal}),vernal,{x:1,y:10}).length);
 assert.equal(stepField({...saved,...vernal,x:1,y:10},'left').district,'lumiose-zone1-courtyard');
});

test('second roof and Side Mission 17 preserve ladder and shiny encounter state',()=>{
 const npc={area:3,district:'lumiose-vert-sector9',interior:null,x:14,y:15,facing:'up',zaRoyaleRank:'W'};
 assert.equal(fieldDialogue(npc).action,undefined);
 assert.equal(fieldDialogue({...npc,zaRoyaleRank:'V'}).action,'zone1Mission17Start');
 const lower={...npc,district:'lumiose-zone1-roof',x:15,y:5,facing:'up',zaSide17Stage:1};
 assert.equal(fieldDialogue(lower).action,'zone1RoofHighLadder');
 const upper={...lower,district:'lumiose-zone1-high-roof',x:15,y:9,facing:'down'};
 assert.equal(fieldDialogue(upper).action,'zone1RoofHighLadder');
 assert.ok(fieldPath(fieldMap(upper),upper,{x:8,y:6}).length);
 const mareep={...upper,x:8,y:6,facing:'up'};
 assert.equal(fieldDialogue(mareep).action,'zone1Mission17Observe');
 assert.equal(fieldDialogue({...mareep,zaSide17Stage:2}).action,'zone1Mission17Battle');
 const saved=restoreAdventurePosition(storeAdventurePosition({...mareep,zaSide17Stage:2,zaSide17MareepCaught:true,teamIds:['kept']},58),58);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaSide17MareepCaught,saved.teamIds],['lumiose-zone1-high-roof',8,6,true,['kept']]);
 assert.notEqual(fieldMap(saved)[5][8],'m');
});

test('Vert Sector 9 waterway keeps its bridge, access and matching legacy saves',()=>{
 const base={area:3,district:'lumiose-vert-sector9',interior:null,x:11,y:9,regionId:6,districtReturnRegion:1,teamIds:['kept']},map=fieldMap(base);
 assert.equal(map[11][4],'~');assert.equal(map[12][18],'~');assert.equal(map[11][11],':');assert.equal(map[14][14],'q');
 for(const y of [11,12]){assert.equal(map[y][0],'~');assert.equal(map[y][22],'~');assert.equal(stepField({...base,x:1,y},'left').blocked,true);assert.equal(stepField({...base,x:21,y},'right').blocked,true);}
 assert.ok(fieldPath(map,{x:1,y:8},{x:11,y:15}).length);assert.ok(fieldPath(map,{x:11,y:9},{x:14,y:15}).length);
 assert.equal(stepField({...base,x:11,y:15},'down').district,'lumiose-zone1');
 const saved=storeAdventurePosition({...base,x:4,y:11},7);delete saved.districtPosition.vert9Layout;
 const restored=restoreAdventurePosition(structuredClone(saved),7);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'~');assert.deepEqual(restored.teamIds,['kept']);
 assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);assert.equal(storeAdventurePosition(restored,8).districtPosition.vert9Layout,1);
});

test('Zone 1 draft roof gap preserves paths and migrates matching old saves',()=>{
 const roof={area:3,district:'lumiose-zone1-roof',interior:null,x:2,y:9,facing:'down',teamIds:['kept']};
 const map=fieldMap(roof);assert.equal(map[5][14],'#');assert.equal(map[7][14],'.');assert.ok(fieldPath(map,roof,{x:20,y:6}).length);
 for(const y of [4,5,6,9]){const old=storeAdventurePosition({...roof,x:14,y},23);delete old.districtPosition.zone1RoofLayout;const loaded=restoreAdventurePosition(old,23);assert.equal(loaded.district,roof.district);assert.notEqual(fieldMap(loaded)[loaded.y][loaded.x],'#');assert.deepEqual(loaded.teamIds,['kept']);}
 const current=storeAdventurePosition(roof,24);assert.equal(current.districtPosition.zone1RoofLayout,1);
});

test('Zone 1 northeastern gate links Vert Sector 8 and Hotel Z approach',()=>{
 const zone={area:3,district:'lumiose-zone1',interior:null,x:17,y:1,facing:'up',teamIds:['kept']};
 const entry=stepField(zone,'up');assert.deepEqual([entry.district,entry.x,entry.y],['lumiose-vert-sector8',11,15]);
 const sector={...zone,...entry};assert.ok(fieldPath(fieldMap(sector),sector,{x:11,y:1}).length);assert.equal(fieldMap(sector)[5][18],';');
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,x:11,y:1},68),68);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[sector.district,11,1,['kept']]);
 const hotel=stepField(saved,'up');assert.deepEqual([hotel.district,hotel.x,hotel.y],['lumiose',15,1]);
 const back=stepField({...saved,...hotel},'up');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-sector8',11,1]);
 assert.equal(stepField({...sector,x:11,y:15},'down').district,'lumiose-zone1');assert.equal(stepField({...zone,x:11},'up').district,'lumiose-vert-sector9');
});
