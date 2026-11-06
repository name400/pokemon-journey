import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Zone 11 north bank connects Jaune Sectors 10 and 12 and Zone 6',()=>{
 const n={area:3,district:'lumiose-zone11',interior:null,x:1,y:4,zaRoyaleRank:'E',teamIds:['kept']};
 const west=stepField(n,'left');assert.equal(west.district,'lumiose-jaune-sector10');assert.equal(stepField({...n,...west},'right').district,'lumiose-zone11');
 assert.equal(stepField({...n,...west,zaRoyaleRank:'F'},'right').blocked,true);
 const east=stepField({...n,x:21},'right');assert.equal(east.district,'lumiose-jaune-sector12');assert.equal(stepField({...n,...east},'left').district,'lumiose-zone11');
 assert.ok(fieldPath(fieldMap({...n,...east}),east,{x:11,y:1}).length);
 const z6=stepField({...n,...east,x:11,y:1},'up');assert.equal(z6.district,'lumiose-zone6');assert.equal(stepField({...n,...z6},'down').district,'lumiose-jaune-sector12');
 assert.equal(fieldPath(fieldMap(n),n,{x:11,y:15}).length,0);
 const saved=restoreAdventurePosition(storeAdventurePosition({...n,...east},9),9);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector12',1,8,['kept']]);
});
test('Jaune Sectors 6, 10 and 12 connect outside Zone 11 even before its rank gate',()=>{
 const s={area:3,district:'lumiose-jaune-sector10',interior:null,x:1,y:8,zaRoyaleRank:'F',teamIds:['kept']};
 const six=stepField(s,'left');assert.equal(six.district,'lumiose-jaune-sector6');assert.equal(stepField({...s,...six},'right').district,'lumiose-jaune-sector10');
 assert.ok(fieldPath(fieldMap(s),s,{x:21,y:4}).length);
 const twelve=stepField({...s,x:21,y:4},'right');assert.equal(twelve.district,'lumiose-jaune-sector12');assert.equal(stepField({...s,...twelve},'left').district,'lumiose-jaune-sector10');
 assert.equal(stepField({...s,x:21,y:8},'right').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...six},9),9);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector6',21,8,['kept']]);
});
test('Jaune Sector 9 connects Sector 10 to the Jaune Plaza approach',()=>{
 const s={area:3,district:'lumiose-jaune-sector10',interior:null,x:11,y:1,teamIds:['kept']};
 const nine=stepField(s,'up');assert.deepEqual([nine.district,nine.x,nine.y],['lumiose-jaune-sector9',11,15]);
 assert.equal(stepField({...s,...nine},'down').district,'lumiose-jaune-sector10');
 assert.ok(fieldPath(fieldMap({...s,...nine}),nine,{x:11,y:1}).length);
 const plaza=stepField({...s,...nine,x:11,y:1},'up');assert.equal(plaza.district,'lumiose-jaune-garden-route');
 assert.equal(stepField({...s,...plaza},'left').district,'lumiose-jaune-sector9');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...nine,x:11,y:8},10),10);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector9',11,8,['kept']]);
});
test('Saison promenade joins Centrico to Jaune Sector 6 while retaining save data',()=>{
 const s={area:3,district:'lumiose-jaune-sector6',interior:null,x:11,y:15,teamIds:['kept'],zaRoyaleRank:'F'};
 const canal=stepField(s,'down');assert.equal(canal.district,'lumiose-saison-canalside');
 assert.equal(stepField({...s,...canal},'up').district,'lumiose-jaune-sector6');
 assert.ok(fieldPath(fieldMap({...s,...canal}),canal,{x:1,y:8}).length);
 const plaza=stepField({...s,...canal,x:1,y:8},'left');assert.equal(plaza.district,'lumiose-centrico-route');
 assert.equal(stepField({...s,...plaza},'up').district,'lumiose-saison-canalside');
 const restored=restoreAdventurePosition(storeAdventurePosition({...s,...canal,x:10,y:9},11),11);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-saison-canalside',10,9,['kept']]);
 assert.equal(fieldMap({...s,...canal})[14][10],'~');
});
test('Jaune Sector 2 joins the Saison promenade and preserves saved position',()=>{
 const s={area:3,district:'lumiose-saison-canalside',interior:null,x:5,y:1,teamIds:['kept']};
 const two=stepField(s,'up');assert.deepEqual([two.district,two.x,two.y],['lumiose-jaune-sector2',11,15]);
 assert.equal(stepField({...s,...two},'down').district,'lumiose-saison-canalside');
 assert.ok(fieldPath(fieldMap({...s,...two}),two,{x:5,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...two,x:5,y:6},12),12);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector2',5,6,['kept']]);
});
test('Jaune Street links Sector 2, Centrico and the Jaune Plaza approach',()=>{
 const s={area:3,district:'lumiose-jaune-sector2',interior:null,x:11,y:1,teamIds:['kept'],zaRoyaleRank:'F'};
 const street=stepField(s,'up');assert.equal(street.district,'lumiose-jaune-street');
 assert.equal(stepField({...s,...street},'down').district,'lumiose-jaune-sector2');
 assert.ok(fieldPath(fieldMap({...s,...street}),street,{x:1,y:8}).length);
 const plaza=stepField({...s,...street,x:1,y:8},'left');assert.equal(plaza.district,'lumiose-centrico-route');
 assert.equal(stepField({...s,...plaza},'up').district,'lumiose-jaune-street');
 const garden=stepField({...s,...street,x:21,y:8},'right');assert.equal(garden.district,'lumiose-jaune-garden-route');
 assert.equal(stepField({...s,...garden},'down').district,'lumiose-jaune-street');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...street,x:11,y:8},13),13);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-street',11,8,['kept']]);
});
test('Jaune Plaza approach connects Sector 6 and North Boulevard',()=>{
 const s={area:3,district:'lumiose-jaune-sector6',interior:null,x:11,y:1,teamIds:['kept'],zaRoyaleRank:'F'};
 const garden=stepField(s,'up');assert.equal(garden.district,'lumiose-jaune-garden-route');
 assert.equal(stepField({...s,...garden},'down').district,'lumiose-jaune-sector6');
 assert.ok(fieldPath(fieldMap({...s,...garden}),garden,{x:21,y:8}).length);
 const north=stepField({...s,...garden,x:21,y:8},'right');assert.equal(north.district,'lumiose-north-boulevard');
 assert.equal(stepField({...s,...north},'down').district,'lumiose-jaune-garden-route');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...garden,x:15,y:15},14),14);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-garden-route',15,15,['kept']]);
});
