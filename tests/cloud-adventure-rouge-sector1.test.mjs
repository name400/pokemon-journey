import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 3 west entrance reaches Sommi and preserves previous connections',()=>{
 const zone={area:3,district:'lumiose-zone3',interior:null,x:1,y:6,facing:'left',zaRoyaleRank:'X',teamIds:['kept']};
 const road=stepField(zone,'left');assert.deepEqual([road.district,road.x,road.y],['lumiose-rouge-sector1',21,8]);
 const sector={...zone,...road};assert.ok(fieldPath(fieldMap(sector),sector,{x:9,y:6}).length);
 assert.equal(fieldDialogue({...sector,x:9,y:6,facing:'up'}).action,'side04Battle');
 assert.equal(fieldDialogue({...sector,x:9,y:6,facing:'up',zaRoyaleRank:'Y'}).action,undefined);
 assert.equal(stepField(sector,'right').district,'lumiose-zone3');
 assert.equal(stepField({...zone,x:1,y:8},'left').district,'lumiose-rouge-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,x:9,y:6},59),59);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-rouge-sector1',9,6,['kept']]);
 const roof={...sector,district:'lumiose-rouge-sector1-roof',x:3,y:12,facing:'down',zaSide04Won:true};
 assert.equal(fieldDialogue(roof).action,'side04Holovator');assert.ok(fieldPath(fieldMap(roof),roof,{x:12,y:6}).length);
 const loaded=restoreAdventurePosition(storeAdventurePosition(roof,60),60);assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.zaSide04Won],['lumiose-rouge-sector1-roof',3,12,true]);
});

test('western rooftop TM remains collected and older roof positions are safe',()=>{
 const roof={area:3,district:'lumiose-rouge-sector1-roof',interior:null,x:3,y:12,facing:'down',zaSide04Won:true,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(roof),roof,{x:5,y:5}).length);
 assert.equal(fieldDialogue({...roof,x:5,y:5,facing:'up'}).action,'rouge1RoofTM005');
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:5,y:5,zaRouge1Tm005:true},61),61);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaRouge1Tm005],['lumiose-rouge-sector1-roof',5,5,['kept'],true]);
 assert.notEqual(fieldMap(saved)[4][5],'t');
 const old=restoreAdventurePosition(storeAdventurePosition({...roof,x:5,y:4},62),62);assert.deepEqual([old.x,old.y],[5,4]);
});

test('Centrico and Rouge Sector 1 connect while mission 20 and old saves remain usable',()=>{
 const old={area:3,district:'lumiose-centrico-route',interior:null,x:7,y:1,facing:'up',zaMission20Stage:11,teamIds:['kept']};
 const entrance=stepField(old,'up');assert.deepEqual([entrance.district,entrance.x,entrance.y],['lumiose-rouge-sector1',11,15]);
 const sector={...old,...entrance};assert.ok(fieldPath(fieldMap(sector),sector,{x:15,y:5}).length);
 assert.equal(stepField({...sector,x:11,y:15},'down').district,'lumiose-centrico-route');
 assert.equal(fieldDialogue({...sector,x:15,y:5,facing:'up'}).action,'mission20SBCStart');
 assert.deepEqual(fieldDialogue({...sector,x:15,y:5,facing:'up',zaMission20SBCSeries:'vivica'}).actions.map(a=>a.action),['mission20SBCNext','mission20SBCCancel']);
 assert.equal(fieldDialogue({...sector,x:14,y:11,facing:'up',zaMission20Stage:12}).action,'mission20SafetyBattle');
 assert.equal(fieldDialogue({...old,x:17,y:11,facing:'up'}).action,'mission20SBCStart');
 const restored=restoreAdventurePosition(storeAdventurePosition({...sector,x:15,y:5,zaMission20SBCSeries:'vivica'},63),63);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.zaMission20SBCSeries,restored.teamIds],['lumiose-rouge-sector1',15,5,'vivica',['kept']]);
});
