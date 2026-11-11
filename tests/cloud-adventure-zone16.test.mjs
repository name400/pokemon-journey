import test from 'node:test';
import assert from 'node:assert/strict';
import {zone16Map,zone16Encounter,zone16Visible,ZONE16_STALLS} from '../lib/cloud-adventure/adventure-zone16.mjs';
import {bleuPlazaRouteMap} from '../lib/cloud-adventure/adventure-bleu-plaza-route.mjs';
import {stepField,fieldPath,fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('Bleu Plaza approaches connect the three entrances to the existing crossings',()=>{
 const s={area:3,district:'lumiose-zone16',interior:null,zaRoyaleRank:'C',teamIds:['kept']},map=zone16Map(s);
 for(const [x,y] of [[11,1],[11,2],[11,3],[8,3],[8,4],[8,5],[16,8],[17,8],[21,8],[1,12],[8,12],[8,11]])assert.equal(map[y][x],',',`${x},${y}`);
 assert.equal(map[4][11],'~');assert.equal(map[6][11],'g');assert.equal(map[8][11],'f');
 for(const [x,y] of [[11,1],[21,8],[1,12]]){
  assert.ok(fieldPath(map,{x,y},{x:11,y:7}).length);
  const restored=restoreAdventurePosition(storeAdventurePosition({...s,x,y},105),105);
  assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[s.district,x,y,['kept']]);
 }
});
test('zone sixteen gate, central monument and saved position',()=>{
 const base={area:3,district:'lumiose-zone5',interior:null,x:17,y:15,facing:'down',zaRoyaleRank:'D'};const street=stepField(base,'down');assert.equal(street.district,'lumiose-bleu-plaza-route');assert.ok(fieldPath(bleuPlazaRouteMap(),street,{x:21,y:8}).length);const savedStreet=restoreAdventurePosition(storeAdventurePosition({...base,...street},5),5);assert.equal(savedStreet.district,'lumiose-bleu-plaza-route');assert.equal(stepField({...base,...street},'up').district,'lumiose-zone5');const gate={...base,...street,x:11,y:15,facing:'down'};assert.equal(stepField(gate,'down').blocked,true);
 const entered=stepField({...gate,zaRoyaleRank:'C'},'down');assert.equal(entered.district,'lumiose-zone16');const s={...base,...entered,zaRoyaleRank:'C'},map=zone16Map(s);assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.equal(map[8][11],'f');assert.equal(zone16Map({zaZone16Spent:{froakie:true}})[8][11],'#');assert.equal(map[4][18],'~');assert.equal(zone16Visible(s,'b').species,870);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:7},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone16',11,7]);assert.equal(stepField(s,'up').district,'lumiose-bleu-plaza-route');const office=stepField({...base,...street,x:21,y:8,facing:'right'},'right');assert.equal(office.district,'lumiose-rust');assert.equal(stepField({...base,...office},'left').district,'lumiose-bleu-plaza-route');assert.equal(zone16Encounter(s,()=>0).speciesId,180);
});
test('all three Zone 16 entrances return to the plaza and respect rank',()=>{
 const base={area:3,district:'lumiose-bleu-plaza-route',interior:null,y:15,zaRoyaleRank:'D',teamIds:['kept']};
 for(const [x,zx,zy,back] of [[16,21,8,'right'],[20,1,12,'left']]){
  const plaza={...base,x};assert.equal(stepField(plaza,'down').blocked,true);
  const zone=stepField({...plaza,zaRoyaleRank:'C'},'down');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone16',zx,zy]);
  const result=stepField({...plaza,...zone},back);assert.deepEqual([result.district,result.x,result.y],['lumiose-bleu-plaza-route',x,15]);
  const saved=restoreAdventurePosition(storeAdventurePosition({...plaza,...zone},9),9);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone16',zx,zy,['kept']]);
 }
});

test('Froakie is on the central monument and a spent encounter restores safely',()=>{
 const s={area:3,district:'lumiose-zone16',interior:null,x:11,y:9,facing:'up',teamIds:['kept'],zaRoyaleRank:'C'};
 assert.equal(zone16Visible(s,'f').species,656);assert.equal(fieldDialogue(s).action,'zone16Wild-froakie');
 const standing=stepField(s,'up');assert.deepEqual([standing.x,standing.y],[11,8]);
 const stored=storeAdventurePosition({...s,...standing,zaZone16Spent:{froakie:true}},56);
 const saved=restoreAdventurePosition(stored,56);assert.equal(saved.district,'lumiose-zone16');
 assert.ok(walkable(zone16Map(saved)[saved.y][saved.x]));assert.deepEqual(saved.teamIds,['kept']);
 assert.equal(saved.zaZone16Spent.froakie,true);assert.equal(restoreAdventurePosition(stored,57).district,null);
});

test('rounded Bleu Plaza water safely restores older positions',()=>{
 const map=zone16Map();
 for(const [x,y] of [[15,5],[7,11],[15,11]]){
  assert.equal(map[y][x],'~');
  const state={area:3,district:'lumiose-zone16',interior:null,x,y,regionId:6,districtReturnRegion:1,zaRoyaleRank:'C',teamIds:['kept']};
  const old=storeAdventurePosition(state,9);delete old.districtPosition.zone16Layout;
  const restored=restoreAdventurePosition(structuredClone(old),9);assert.equal(restored.district,state.district);assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);
  assert.equal(restoreAdventurePosition(structuredClone(old),10).district,null);assert.equal(storeAdventurePosition(restored,10).districtPosition.zone16Layout,3);
 }
});


test('Bleu Plaza island has three draft crossings and safely restores earlier paths',()=>{
 const map=zone16Map();for(const [x,y] of [[8,5],[16,8],[8,11]])assert.equal(map[y][x],',');
 for(const [x,y] of [[11,4],[11,12],[6,8],[14,5],[14,11]]){
  assert.equal(map[y][x],'~');const state={area:3,district:'lumiose-zone16',interior:null,x,y,zaRoyaleRank:'C',teamIds:['kept']};
  const old=storeAdventurePosition(state,19);old.districtPosition.zone16Layout=1;const restored=restoreAdventurePosition(structuredClone(old),19);
  assert.equal(restored.district,state.district);assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(old),20).district,null);
 }
 for(const start of [{x:8,y:4},{x:17,y:8},{x:8,y:12}])assert.ok(fieldPath(map,start,{x:11,y:7}).length);
});

test('southwest ladder reaches a separate rooftop and preserves earlier ground saves',()=>{
 const s={area:3,district:'lumiose-zone16',interior:null,x:4,y:13,facing:'down',zaRoyaleRank:'C',teamIds:['kept']};
 assert.equal(fieldDialogue(s).action,'zone16RoofLadder');assert.equal(zone16Map(s)[14][4],'l');
 const roof={...s,x:4,y:9,zaZone16Upper:true};assert.equal(fieldDialogue(roof).action,'zone16RoofLadder');assert.ok(fieldPath(zone16Map(roof),roof,{x:18,y:8}).length);
 const stored=storeAdventurePosition(roof,54),loaded=restoreAdventurePosition(stored,54);assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.zaZone16Upper,loaded.teamIds],[s.district,4,9,true,['kept']]);
 const old=storeAdventurePosition({...s,x:4,y:14},55),restored=restoreAdventurePosition(old,55);assert.deepEqual([restored.x,restored.y],[4,14]);assert.ok(walkable(zone16Map(restored)[14][4]));
});


test('draft market stalls preserve older saves and the police facade preserves collision',()=>{
 const map=zone16Map(), street=bleuPlazaRouteMap();
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)assert.equal(walkable(street[y][x]),false);
 for(const [x,y] of ZONE16_STALLS){
  assert.equal(map[y][x],'^');
  const state={area:3,district:'lumiose-zone16',interior:null,x,y,zaRoyaleRank:'C',teamIds:['kept']};
  const old=storeAdventurePosition(state,31);old.districtPosition.zone16Layout=2;
  const restored=restoreAdventurePosition(structuredClone(old),31);
  assert.equal(restored.district,state.district);assert.ok(walkable(map[restored.y][restored.x]));
  assert.deepEqual(restored.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(old),32).district,null);
 }
 for(const start of [{x:11,y:1},{x:21,y:8},{x:1,y:12}])assert.ok(fieldPath(map,start,{x:11,y:7}).length);
});


test('Zone 16 northwest gate reaches the Rust office without changing older exits',()=>{
 const zone={area:3,district:'lumiose-zone16',interior:null,x:8,y:1,facing:'up',zaRoyaleRank:'C',teamIds:['kept']},map=zone16Map(zone);
 assert.equal(map[0][8],'X');assert.ok(fieldPath(map,zone,{x:8,y:5}).length);
 const office=stepField(zone,'up');assert.deepEqual([office.district,office.x,office.y],['lumiose-rust',1,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...office},132),132);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-rust',1,12,['kept']]);
 assert.equal(stepField({...saved,zaRoyaleRank:'D'},'left').blocked,true);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y,back.zaZone16Upper],['lumiose-zone16',8,1,false]);
 assert.equal(stepField({...zone,x:11,y:1},'up').district,'lumiose-bleu-plaza-route');
 assert.equal(stepField({...zone,zaZone16Upper:true},'up').blocked,true);
});

test('raised garden stairs and shared Ampharos keep ground and garden saves',()=>{
 const ground={area:3,district:'lumiose-zone16',interior:null,x:17,y:7,facing:'up',zaRoyaleRank:'C',teamIds:['kept']};
 assert.equal(zone16Map(ground)[6][17],'j');assert.equal(fieldDialogue(ground).action,'zone16GardenStairs');
 const garden={...ground,district:'lumiose-zone16-garden',x:17,y:11,facing:'down'},map=fieldMap(garden);assert.equal(fieldDialogue(garden).action,'zone16GardenStairs');assert.ok(fieldPath(map,garden,{x:18,y:3}).length);assert.equal(map[2][18],'d');assert.equal(zone16Visible(garden,'d').species,181);
 for(const state of [ground,garden]){const saved=restoreAdventurePosition(storeAdventurePosition(state,152),152);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[state.district,state.x,state.y,['kept']]);}
 const spent={...garden,zaZone16Spent:{'ampharos-alpha':true}};assert.equal(fieldMap(spent)[2][18],'.');assert.equal(zone16Visible(spent,'d'),null);assert.equal(zone16Visible({...ground,zaZone16Spent:spent.zaZone16Spent},'d'),null);
});
