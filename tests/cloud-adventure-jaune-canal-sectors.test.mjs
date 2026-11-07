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
test('Saison bridge connects Vert Sector 3 and Vert Plaza',()=>{
 const s={area:3,district:'lumiose-saison-canalside',interior:null,x:19,y:15,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(s),{x:1,y:8},{x:19,y:15}).length);
 const sector=stepField(s,'down');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-vert-sector3',11,1]);
 assert.equal(stepField({...s,...sector},'up').district,'lumiose-saison-canalside');
 assert.ok(fieldPath(fieldMap({...s,...sector}),sector,{x:11,y:15}).length);
 const plaza=stepField({...s,...sector,x:11,y:15},'down');assert.equal(plaza.district,'lumiose-vert-plaza');
 assert.equal(stepField({...s,...plaza},'up').district,'lumiose-vert-sector3');
 const restored=restoreAdventurePosition(storeAdventurePosition({...s,...sector,x:11,y:8},15),15);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-vert-sector3',11,8,['kept']]);
});
test('Vert Sector 3 connects Coulant Waterway and Vert Street',()=>{
 const s={area:3,district:'lumiose-vert-sector3',interior:null,x:21,y:7,teamIds:['kept']};
 const canal=stepField(s,'right');assert.equal(canal.district,'lumiose-coulant-route');
 assert.equal(stepField({...s,...canal},'left').district,'lumiose-vert-sector3');
 assert.ok(fieldPath(fieldMap(s),s,{x:17,y:15}).length);
 const street=stepField({...s,x:17,y:15},'down');assert.equal(street.district,'lumiose-vert-street-route');
 assert.equal(stepField({...s,...street},'up').district,'lumiose-vert-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...canal},16),16);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-coulant-route',1,4,['kept']]);
});
test('Vert Sector 1 connects Vert Sector 3 and Vert Street',()=>{
 const s={area:3,district:'lumiose-vert-sector3',interior:null,x:1,y:7,teamIds:['kept']};
 const one=stepField(s,'left');assert.equal(one.district,'lumiose-vert-sector1');
 assert.equal(stepField({...s,...one},'right').district,'lumiose-vert-sector3');
 assert.ok(fieldPath(fieldMap({...s,...one}),one,{x:11,y:15}).length);
 const street=stepField({...s,...one,x:11,y:15},'down');assert.equal(street.district,'lumiose-vert-street-route');
 assert.equal(stepField({...s,...street},'up').district,'lumiose-vert-sector1');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...one,x:11,y:8},17),17);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector1',11,8,['kept']]);
});
test('Vert Sector 6 bridge leads to Sector 7 without altering Zone 17 gate',()=>{
 const s={area:3,district:'lumiose-vert-sector6',interior:null,x:21,y:3,teamIds:['kept'],zaRoyaleRank:'F'};
 const seven=stepField(s,'right');assert.equal(seven.district,'lumiose-vert-sector7');
 assert.equal(stepField({...s,...seven},'left').district,'lumiose-vert-sector6');
 assert.ok(fieldPath(fieldMap(s),{x:11,y:15},{x:21,y:3}).length);
 assert.equal(stepField({...s,x:11,y:15},'down').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...seven,x:11,y:8},18),18);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-sector7',11,8,['kept']]);
});
test('Vert Sector 7 connects South Boulevard without disrupting the Sector 6 route',()=>{
 const s={area:3,district:'lumiose-vert-sector7',interior:null,x:11,y:15,teamIds:['kept']};
 const road=stepField(s,'down');assert.deepEqual([road.district,road.x,road.y],['lumiose-south-boulevard',18,1]);
 assert.equal(stepField({...s,...road},'up').district,'lumiose-vert-sector7');
 assert.ok(fieldPath(fieldMap(s),s,{x:1,y:8}).length);
 assert.equal(stepField({...s,x:1,y:8},'left').district,'lumiose-vert-sector6');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...road},19),19);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-south-boulevard',18,1,['kept']]);
});
test('Vert Sector 2 garden keeps the northwest Zone 2 gate and old saves walkable',()=>{
 const s={area:3,district:'lumiose-vert2',interior:null,x:21,y:8,teamIds:['kept']};
 const map=fieldMap(s);assert.equal(map[4][8],'k');assert.equal(map[8][19],':');
 const zone=stepField(s,'right');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone2',4,1]);
 assert.equal(stepField({...s,...zone},'up').district,'lumiose-vert2');
 assert.ok(fieldPath(map,{x:1,y:8},s).length);
 const restored=restoreAdventurePosition(storeAdventurePosition({...s,x:8,y:4},20),20);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-vert2',8,4,['kept']]);
});

test('Jaune Street meets North Boulevard without affecting saved progress',()=>{
 const street={area:3,district:'lumiose-jaune-street',interior:null,x:15,y:1,zaRoyaleRank:'D',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(street),street,{x:11,y:8}).length);
 const north=stepField(street,'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-north-boulevard',19,15]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,...north},64),64);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaRoyaleRank,saved.teamIds],['lumiose-north-boulevard',19,15,'D',['kept']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-jaune-street',15,1]);
});

test('canal building drafts retain approaches and safely migrate legacy positions',()=>{
 for(const [district,old,starts,targets] of [
  ['lumiose-magenta-canal-route',{x:3,y:3},{x:10,y:8},[{x:10,y:1},{x:1,y:8},{x:1,y:12},{x:10,y:15},{x:21,y:8},{x:21,y:12}]],
  ['lumiose-saison-canalside',{x:7,y:2},{x:10,y:8},[{x:5,y:1},{x:11,y:1},{x:17,y:1},{x:1,y:8},{x:19,y:15}]],
 ]){
  const base={area:3,district,interior:null,...old,regionId:6,districtReturnRegion:1,teamIds:['kept'],zaRoyaleRank:'E'};
  const map=fieldMap(base);assert.equal(map[old.y][old.x],'%');
  for(const target of targets)assert.ok(fieldPath(map,starts,target).length,`${district} ${target.x},${target.y}`);
  const saved=storeAdventurePosition(base,7);delete saved.districtPosition.canalBuildingsLayout;
  const restored=restoreAdventurePosition(structuredClone(saved),7);assert.equal(restored.district,district);assert.notEqual(map[restored.y][restored.x],'%');assert.deepEqual(restored.teamIds,['kept']);
  assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);assert.equal(storeAdventurePosition(restored,8).districtPosition.canalBuildingsLayout,1);
 }
});

test('Coulant eastern streets connect Vert Sectors 6 and 7 in both directions',()=>{
 for(const [y,district,x] of [[4,'lumiose-vert-sector6',19],[12,'lumiose-vert-sector7',18]]){
  const original={area:3,district:'lumiose-coulant-route',interior:null,x:21,y,zaRoyaleRank:'V',teamIds:['kept']};
  const out=stepField(original,'right');assert.deepEqual([out.district,out.x,out.y],[district,x,1]);
  const arrived={...original,...out};const saved=storeAdventurePosition(arrived,7);const restored=restoreAdventurePosition(saved,7);
  assert.deepEqual([restored.district,restored.x,restored.y],[district,x,1]);assert.deepEqual(restored.teamIds,['kept']);
  const back=stepField(restored,'up');assert.deepEqual([back.district,back.x,back.y],['lumiose-coulant-route',21,y]);
 }
});

test('Saison Canal street joins Magenta and Jaune approaches through Centrico without the wild-zone gate',()=>{
 const initial={area:3,district:'lumiose-magenta-canal-route',interior:null,x:21,y:14,regionId:6,districtReturnRegion:1,zaRoyaleRank:'V',teamIds:['kept']};
 const toCenter=stepField(initial,'right');assert.deepEqual([toCenter.district,toCenter.x,toCenter.y],['lumiose-centrico-route',1,12]);
 const restored=restoreAdventurePosition(storeAdventurePosition({...initial,...toCenter},7),7);assert.deepEqual(restored.teamIds,['kept']);
 const back=stepField(restored,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-canal-route',21,14]);
 const map=fieldMap(restored);assert.ok(fieldPath(map,{x:1,y:12},{x:9,y:1}).length);
 const toSaison=stepField({...restored,x:9,y:1},'up');assert.deepEqual([toSaison.district,toSaison.x,toSaison.y],['lumiose-saison-canalside',1,8]);
 const toCenterAgain=stepField({...restored,...toSaison},'left');assert.deepEqual([toCenterAgain.district,toCenterAgain.x,toCenterAgain.y],['lumiose-centrico-route',9,1]);
});
