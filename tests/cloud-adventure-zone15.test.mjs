import test from 'node:test';
import assert from 'node:assert/strict';
import {zone15Map,zone15Encounter,zone15Visible,zone15Item} from '../lib/cloud-adventure/adventure-zone15.mjs';
import {stepField,fieldPath,fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
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
