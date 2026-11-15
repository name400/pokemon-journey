import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Magenta Sector 3 links Estival Avenue without changing the lift or older gates',()=>{
 const start={area:3,district:'lumiose-magenta-sector3',interior:null,x:19,y:9,facing:'up',zaMission15Stage:2,zaRoyaleRank:'Z',teamIds:['kept']};
 assert.equal(fieldDialogue(start).action,'magenta3Holovator');
 assert.ok(fieldPath(fieldMap(start),start,{x:11,y:15}).length);
 const south=stepField({...start,x:11,y:15},'down');assert.deepEqual([south.district,south.x,south.y],['lumiose-estival-approach',15,1]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...start,...south},140),140);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission15Stage],['lumiose-estival-approach',15,1,['kept'],2]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector3',11,15]);
 assert.equal(stepField({...start,x:21,y:10},'right').district,'lumiose-magenta-sector1');
 assert.equal(stepField({...start,x:1,y:8},'left').district,'lumiose-magenta-sector6');
 assert.equal(stepField({...start,x:4,y:1,zaMission15Stage:undefined},'up').blocked,true);
 const old=restoreAdventurePosition(storeAdventurePosition(start,141),141);assert.deepEqual([old.district,old.x,old.y,old.teamIds],['lumiose-magenta-sector3',19,9,['kept']]);
});

test('Magenta Sector 3 links Magenta Street without changing the canal or Zone 7 gate',()=>{
 const start={area:3,district:'lumiose-magenta-sector3',interior:null,x:19,y:9,facing:'up',zaRoyaleRank:'W',teamIds:['kept']};
 assert.equal(fieldDialogue(start).action,'magenta3Holovator');assert.ok(fieldPath(fieldMap(start),start,{x:19,y:1}).length);
 const north=stepField({...start,x:19,y:1},'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-magenta-street',14,15]);
 const street={...start,...north},map=fieldMap(street);assert.equal(map[4][5],'~');assert.equal(map[8][5],':');
 const saved=restoreAdventurePosition(storeAdventurePosition(street,142),142);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-street',14,15,['kept']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector3',19,1]);
 assert.equal(stepField({...start,x:4,y:1},'up').blocked,true);
 assert.equal(stepField({...start,x:11,y:15},'down').district,'lumiose-estival-approach');
 const old=restoreAdventurePosition(storeAdventurePosition(start,143),143);assert.deepEqual([old.district,old.x,old.y,old.teamIds],['lumiose-magenta-sector3',19,9,['kept']]);
});
test('Magenta Sector 3 draft rooftop links lift, scaffold and Mission 17 while preserving saves',()=>{
 const street={area:3,district:'lumiose-magenta-sector3',interior:null,x:19,y:9,facing:'up',zaMission15Stage:2,teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'magenta3Holovator');
 const roof={...street,district:'lumiose-magenta-sector3-roof',x:2,y:13,facing:'down'};
 assert.equal(fieldDialogue(roof).action,'magenta3Holovator');
 const map=fieldMap(roof);assert.equal(map[7][10],',');assert.ok(fieldPath(map,roof,{x:18,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:18,y:6,facing:'up'},85),85);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector3-roof',18,6,['kept']]);
 assert.equal(fieldDialogue(saved).action,'battleMission15Case');
 assert.equal(fieldDialogue({...saved,zaMission17Complete:true,zaMission17RewardPending:true}).action,'claimMission15Stone');
 assert.notEqual(fieldMap({...saved,zaMission17Complete:true})[5][18],'d');
});

test('Magenta Sector 3 roof gap and return ladder preserve old locations',()=>{
 const roof={area:3,district:'lumiose-magenta-sector3-roof',interior:null,x:20,y:9,facing:'down',zaMission15Stage:2,teamIds:['kept']},map=fieldMap(roof);
 assert.equal(map[10][20],'v');assert.equal(fieldDialogue(roof).action,'magenta3RoofGap');assert.ok(fieldPath(map,{x:2,y:13},roof).length);
 const previous=restoreAdventurePosition(storeAdventurePosition({...roof,x:20,y:10},135),135);assert.deepEqual([previous.district,previous.x,previous.y,previous.teamIds],[roof.district,20,10,['kept']]);
 const gap={...roof,district:'lumiose-magenta3-gap',x:6,y:4,facing:'up'};assert.equal(fieldMap(gap)[3][6],'l');assert.equal(fieldDialogue(gap).action,'magenta3RoofGap');assert.ok(fieldPath(fieldMap(gap),gap,{x:6,y:13}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition(gap,136),136);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaMission15Stage,restored.teamIds],[gap.district,6,4,2,['kept']]);
});


test('Magenta 3 roof descends toward Sector 6 scaffold and preserves earlier positions',()=>{
 const roof={area:3,district:'lumiose-magenta-sector3-roof',interior:null,x:19,y:11,facing:'right',zaMission15Stage:2,teamIds:['kept']},map=fieldMap(roof);
 assert.equal(map[11][20],'v');assert.deepEqual(fieldDialogue(roof).actions.map(v=>v.action),['magenta3DropCourtAlley','magenta3DropSector6']);assert.ok(fieldPath(map,{x:2,y:13},roof).length);
 const old=restoreAdventurePosition(storeAdventurePosition({...roof,x:20,y:11},137),137);assert.deepEqual([old.district,old.x,old.y,old.teamIds],[roof.district,20,11,['kept']]);
 const street={...roof,district:'lumiose-magenta-sector6',x:3,y:6,facing:'up'};assert.equal(fieldMap(street)[6][3],'.');assert.ok(fieldPath(fieldMap(street),street,{x:2,y:6}).length);
 assert.equal(fieldDialogue({...roof,x:20,y:9,facing:'down'}).action,'magenta3RoofGap');
});
