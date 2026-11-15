import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Bleu Street connects plaza, South Boulevard, and Sector 7 with safe saves',()=>{
 const city={area:3,district:'lumiose-bleu-plaza-route',interior:null,x:5,y:15,teamIds:['kept']};
 const street=stepField(city,'down');assert.deepEqual([street.district,street.x,street.y],['lumiose-bleu-street',11,1]);
 assert.equal(stepField({...city,...street},'up').district,'lumiose-bleu-plaza-route');
 assert.ok(fieldPath(fieldMap({...city,...street}),street,{x:11,y:15}).length);
 assert.ok(fieldPath(fieldMap({...city,...street}),street,{x:21,y:8}).length);
 const south=stepField({...city,...street,x:11,y:15},'down');assert.equal(south.district,'lumiose-south-boulevard');
 assert.equal(stepField({...city,...south},'up').district,'lumiose-bleu-street');
 const east=stepField({...city,...street,x:21,y:8},'right');assert.equal(east.district,'lumiose-bleu-sector7');
 assert.equal(stepField({...city,...east},'left').district,'lumiose-bleu-street');
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,...street,x:11,y:8},8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-street',11,8,['kept']]);
 assert.equal(stepField({...city,x:1,y:8},'left').district,'lumiose-bleu6-approach');
});

test('Bleu Street joins Sector 6 and retains its existing Espace Vide connection',()=>{
 const street={area:3,district:'lumiose-bleu-street',interior:null,x:1,y:8,teamIds:['kept']};
 const b6=stepField(street,'left');assert.deepEqual([b6.district,b6.x,b6.y],['lumiose-bleu6-approach',21,8]);
 assert.equal(stepField({...street,...b6},'right').district,'lumiose-bleu-street');
 assert.ok(fieldPath(fieldMap({...street,...b6}),b6,{x:11,y:1}).length);
 assert.equal(stepField({...street,...b6,x:11,y:1},'up').district,'lumiose-espace-vide');
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,...b6},9),9);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu6-approach',21,8,['kept']]);
});

test('Bleu Sector 8 joins Bleu Street while retaining the Passage route and saves',()=>{
 const start={area:3,district:'lumiose-bleu-sector8',interior:null,x:11,y:8,teamIds:['kept'],zaMission20Stage:7};
 assert.ok(fieldPath(fieldMap(start),start,{x:21,y:6}).length);
 const east=stepField({...start,x:21,y:6},'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-bleu-street',1,10]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...start,...east},108),108);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission20Stage],['lumiose-bleu-street',1,10,['kept'],7]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-bleu-sector8',21,6]);
 assert.equal(stepField({...start,x:21,y:8},'right').district,'lumiose-passage-felicite');
 assert.equal(stepField({...start,x:11,y:1},'up').district,'lumiose-bleu6-approach');
 const legacy=restoreAdventurePosition(storeAdventurePosition({...start,x:21,y:8},109),109);assert.deepEqual([legacy.district,legacy.x,legacy.y,legacy.teamIds],['lumiose-bleu-sector8',21,8,['kept']]);
});

test('Bleu Sector 5 joins Bleu Street without bypassing the park gate',()=>{
 const start={area:3,district:'lumiose-bleu-sector5',interior:null,x:10,y:8,teamIds:['kept'],zaRoyaleRank:'W',zaMission20Stage:7};
 assert.ok(fieldPath(fieldMap(start),start,{x:1,y:6}).length);
 const west=stepField({...start,x:1,y:6},'left');assert.deepEqual([west.district,west.x,west.y],['lumiose-bleu-street',21,10]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...start,...west},110),110);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission20Stage],['lumiose-bleu-street',21,10,['kept'],7]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-bleu-sector5',1,6]);
 assert.equal(stepField({...start,x:21,y:5},'right').blocked,true);
 assert.equal(stepField({...start,x:1,y:8},'left').district,'lumiose-bleu-cafe2');
 assert.equal(stepField({...start,x:10,y:15},'down').district,'lumiose-bleu-sector7');
 const old=restoreAdventurePosition(storeAdventurePosition(start,111),111);assert.deepEqual([old.district,old.x,old.y,old.teamIds],['lumiose-bleu-sector5',10,8,['kept']]);
});

test('Bleu Sector 5 joins the outer plaza without bypassing Zone 16',()=>{
 const start={area:3,district:'lumiose-bleu-sector5',interior:null,x:10,y:8,teamIds:['kept'],zaRoyaleRank:'W',zaMission20Stage:7};
 assert.ok(fieldPath(fieldMap(start),start,{x:10,y:1}).length);
 const north=stepField({...start,x:10,y:1},'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-bleu-plaza-route',8,15]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...start,...north},112),112);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission20Stage],['lumiose-bleu-plaza-route',8,15,['kept'],7]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-bleu-sector5',10,1]);
 for(const x of [11,16,20])assert.equal(stepField({...saved,x,y:15},'down').blocked,true);
 assert.equal(stepField({...start,x:21,y:5},'right').blocked,true);
 assert.equal(stepField({...start,x:1,y:6},'left').district,'lumiose-bleu-street');
 const old=restoreAdventurePosition(storeAdventurePosition(start,113),113);assert.deepEqual([old.district,old.x,old.y,old.teamIds],['lumiose-bleu-sector5',10,8,['kept']]);
});
