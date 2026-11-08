import test from 'node:test';
import assert from 'node:assert/strict';
import {zone15Map,zone15Encounter,zone15Visible,zone15Item} from '../lib/cloud-adventure/adventure-zone15.mjs';
import {stepField,fieldPath,fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 15 southern gate connects North Boulevard while retaining the older west route',()=>{
 const zone={area:3,district:'lumiose-zone15',interior:null,x:17,y:15,zaRoyaleRank:'D',regionId:6,districtReturnRegion:1,teamIds:['kept']};
 const road=stepField(zone,'down');assert.deepEqual([road.district,road.x,road.y],['lumiose-north-boulevard',20,1]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...road},107),107);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[road.district,20,1,['kept']]);
 assert.equal(stepField({...saved,zaRoyaleRank:'E'},'up').blocked,true);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y,back.zaZone15Upper],['lumiose-zone15',17,15,false]);
 assert.equal(stepField({...zone,x:1,y:8},'left').district,'lumiose-north-boulevard');
 assert.notEqual(zone15Map({...zone,zaZone15Upper:true})[16][17],'X');
});

test('Zone 15 southwest gate connects Jaune Sector 7 without losing legacy routes',()=>{
 const zone={area:3,district:'lumiose-zone15',interior:null,x:1,y:13,zaRoyaleRank:'D',regionId:6,districtReturnRegion:1,teamIds:['kept']};
 assert.ok(fieldPath(zone15Map(zone),zone,{x:11,y:9}).length);
 const road=stepField(zone,'left');assert.deepEqual([road.district,road.x,road.y],['lumiose-jaune-sector7',21,12]);
 assert.ok(fieldPath(fieldMap({...zone,...road}),road,{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...road},108),108);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[road.district,21,12,['kept']]);
 assert.equal(stepField({...saved,zaRoyaleRank:'E'},'right').blocked,true);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y,back.zaZone15Upper],['lumiose-zone15',1,13,false]);
 assert.equal(stepField({...zone,x:11,y:15},'down').district,'lumiose-jaune-sector7');
 assert.notEqual(zone15Map({...zone,zaZone15Upper:true})[13][0],'X');
});

test('Zone 15 street approaches retain grass, object positions and old floor saves',()=>{
 const s={area:3,district:'lumiose-zone15',interior:null,zaRoyaleRank:'D',regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone15Map(s);
 for(let y=1;y<=5;y++)for(const x of [10,11,12])assert.equal(map[y][x],',');
 for(let y=11;y<=15;y++)for(const x of [10,11,12])assert.equal(map[y][x],',');
 for(let x=11;x<=17;x++)assert.equal(map[15][x],',');
 assert.equal(map[6][11],'g');assert.equal(map[8][11],'a');assert.equal(map[13][2],'l');
 for(const [x,y] of [[11,1],[10,4],[17,15]]){
  const restored=restoreAdventurePosition(storeAdventurePosition({...s,x,y},109),109);
  assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[s.district,x,y,['kept']]);
 }
});
test('zone fifteen gate, day/night encounters and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'E'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'D'},'up');assert.equal(entered.district,'lumiose-zone15');const s={...base,...entered,zaRoyaleRank:'D'},map=zone15Map(s);assert.ok(fieldPath(map,s,{x:11,y:9}).length);assert.equal(zone15Visible({...s,zaZone15Period:'day'},'b').species,545);assert.equal(zone15Visible({...s,zaZone15Period:'night'},'b').species,353);assert.equal(zone15Visible({...s,zaZone15Period:'day'},'d').species,15);assert.equal(zone15Visible({...s,zaZone15Period:'night'},'d').species,354);assert.equal(zone15Item(s,'i').kind,'ultraball');assert.equal(zone15Item({...s,zaZone15Items:['cafe-ultra']},'i'),null);const roof={...s,zaZone15Upper:true,zaZone15LiftUnlocked:true,x:10,y:7};assert.equal(stepField(roof,'right').blocked,true);assert.equal(stepField({...roof,zaZone15WebOpen:true},'right').x,11);assert.equal(zone15Visible(roof,'a').species,246);const savedRoof=restoreAdventurePosition(storeAdventurePosition(roof,43),43);assert.equal(savedRoof.zaZone15Upper,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:9},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone15',11,9]);assert.equal(stepField(s,'left').district,'lumiose-north-boulevard');assert.equal(zone15Encounter('day',()=>.3).speciesId,545);assert.equal(zone15Encounter('night',()=>.4).speciesId,353);
});
test('Zone 15 connects Jaune Sector 7 and its city street with rank gate',()=>{
 const zone={area:3,district:'lumiose-zone15',interior:null,x:11,y:15,zaRoyaleRank:'D',teamIds:['kept']};
 const sector=stepField(zone,'down');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-jaune-sector7',11,1]);
 assert.equal(stepField({...zone,...sector,zaRoyaleRank:'C'},'up').district,'lumiose-zone15');
 assert.equal(stepField({...zone,...sector,zaRoyaleRank:'E'},'up').blocked,true);
 const street=stepField({...zone,...sector,x:1,y:8},'left');assert.equal(street.district,'lumiose-jaune-street');
 assert.equal(stepField({...zone,...street},'up').district,'lumiose-jaune-sector7');
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...sector},26),26);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector7',11,1,['kept']]);
});
test('Hibernal Avenue connects Centrico to the north ground gate of Zone 15',()=>{
 const road={area:3,district:'lumiose-hibernal-approach',interior:null,x:11,y:1,zaRoyaleRank:'E',teamIds:['kept']};
 assert.equal(stepField(road,'up').blocked,true);
 const open={...road,zaRoyaleRank:'D'},zone=stepField(open,'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone15',11,1]);
 assert.equal(stepField({...open,...zone},'up').district,'lumiose-hibernal-approach');
 const centrico=stepField({...open,x:11,y:15},'down');assert.equal(centrico.district,'lumiose-centrico-route');
 assert.equal(stepField({...open,...centrico},'up').district,'lumiose-hibernal-approach');
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,x:11,y:8},27),27);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-hibernal-approach',11,8,['kept']]);
});

test('Zone 15 northern rooftop joins a separate Sector 7 roof and preserves saves',()=>{
 const upper={area:3,district:'lumiose-zone15',interior:null,x:15,y:1,zaZone15Upper:true,zaZone15WebOpen:true,zaRoyaleRank:'D',regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42};
 assert.ok(fieldPath(zone15Map(upper),{x:15,y:5},{x:15,y:1}).length);
 const out=stepField(upper,'up');assert.deepEqual([out.district,out.x,out.y],['lumiose-jaune7-roof',11,15]);
 const roof={...upper,...out};const saved=storeAdventurePosition(roof,7);const restored=restoreAdventurePosition(structuredClone(saved),7);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],['lumiose-jaune7-roof',11,15,['kept'],42]);
 assert.ok(fieldPath(fieldMap(restored),{x:11,y:15},{x:4,y:5}).length);
 const back=stepField(restored,'down');assert.deepEqual([back.district,back.x,back.y,back.zaZone15Upper],['lumiose-zone15',15,1,true]);
 assert.equal(stepField({...restored,zaRoyaleRank:'V'},'down').blocked,true);assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);
});


test('Hibernal Avenue lift is reachable and keeps older street positions',()=>{
 const street={area:3,district:'lumiose-hibernal-approach',interior:null,x:14,y:6,facing:'up',zaRoyaleRank:'D',teamIds:['kept']};
 assert.equal(fieldMap(street)[5][14],'j');assert.equal(fieldDialogue(street).action,undefined);assert.equal(fieldDialogue({...street,zaZone15LiftUnlocked:true}).action,'zone15Lift');
 assert.ok(fieldPath(fieldMap(street),{x:11,y:15},{x:14,y:6}).length);const old=storeAdventurePosition({...street,x:14,y:5},71),saved=restoreAdventurePosition(old,71);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[street.district,14,5,['kept']]);
});

test('Adjacent Zone 15 roof lift keeps the older route and saved positions',()=>{
 const street={area:3,district:'lumiose-hibernal-approach',interior:null,x:14,y:6,facing:'up',zaRoyaleRank:'D',zaZone15LiftUnlocked:true,teamIds:['kept']};
 assert.deepEqual(fieldDialogue(street).actions.map(x=>x.action),['zone15OuterLift','zone15Lift']);
 const roof={...street,district:'lumiose-jaune7-roof',x:6,y:7,zaZone15WebOpen:true};assert.equal(fieldMap(roof)[6][6],'j');assert.equal(fieldDialogue(roof).action,'zone15OuterLift');
 assert.ok(fieldPath(fieldMap(roof),roof,{x:11,y:15}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition(roof,116),116);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[roof.district,6,7,['kept']]);
});


test('Adjacent rooftop web gates the exit and recovers older positions',()=>{
 const roof={area:3,district:'lumiose-jaune7-roof',interior:null,x:9,y:8,facing:'right',zaRoyaleRank:'D',teamIds:['kept']};
 assert.equal(fieldMap(roof)[8][10],'r');assert.equal(stepField(roof,'right').blocked,true);assert.equal(fieldDialogue(roof).action,'zone15Web');
 const open={...roof,zaZone15WebOpen:true};assert.equal(fieldMap(open)[8][10],',');assert.ok(fieldPath(fieldMap(open),open,{x:11,y:15}).length);
 const old=storeAdventurePosition({...roof,x:10},118),restored=restoreAdventurePosition(old,118);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-jaune7-roof',9,8,['kept']]);
 assert.equal(restoreAdventurePosition(storeAdventurePosition({...open,x:10},119),119).x,10);
});
