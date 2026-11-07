import test from 'node:test';
import assert from 'node:assert/strict';
import {zone6Map,zone6Encounter,zone6Layer,zone6Visible,zone6Item} from '../lib/cloud-adventure/adventure-zone6.mjs';
import {stepField,storeAdventurePosition,restoreAdventurePosition,fieldPath,fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';

test('zone six connects city and gated northern zone eleven via its bridge',()=>{
 const city={area:3,district:'lumiose-vert2',interior:null,x:17,y:1,facing:'up'},enter=stepField(city,'up');assert.deepEqual([enter.district,enter.x,enter.y],['lumiose-zone6',11,1]);
 const z={...city,...enter},map=zone6Map(z);assert.ok(fieldPath(map,z,{x:11,y:15}).length);assert.equal(stepField({...z,x:9,y:8},'down').blocked,true);
 assert.equal(stepField({...z,x:11,y:15},'down').blocked,true);
 const late={...z,zaRoyaleRank:'E'},to11=stepField({...late,x:11,y:15},'down');assert.deepEqual([to11.district,to11.x,to11.y],['lumiose-zone11',5,1]);
 assert.deepEqual([stepField({...late,...to11},'up').district,stepField(z,'up').district],['lumiose-zone6','lumiose-vert2']);
 const saved=storeAdventurePosition({...z,x:11,y:10},42),restored=restoreAdventurePosition(saved,42);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone6',11,10]);assert.equal(restoreAdventurePosition(saved,43).district,null);
 const canal={...z,zaZone6Layer:'canal',x:3,y:6},under=zone6Map(canal);assert.equal(zone6Layer(z),'ground');assert.ok(fieldPath(under,canal,{x:19,y:7}).length);assert.equal(stepField({...canal,x:12,y:7},'down').blocked,true);assert.equal(zone6Visible(canal,'a').species,129);const roof={...z,zaZone6Layer:'roof',x:17,y:4};assert.equal(zone6Map(roof)[12][12],'t');assert.equal(zone6Visible(roof,'a').species,180);for(const v of [canal,roof]){const r=restoreAdventurePosition(storeAdventurePosition(v,51),51);assert.deepEqual([r.district,r.zaZone6Layer,r.x,r.y],[v.district,v.zaZone6Layer,v.x,v.y]);}
 assert.equal(zone6Encounter(()=>0).speciesId,228);assert.equal(zone6Encounter(()=>.999).speciesId,427);
});

test('zone six high roof keeps alpha, items and saved layer',()=>{
 const high={area:3,district:'lumiose-zone6',interior:null,zaZone6Layer:'high',x:17,y:4,facing:'up'};
 const map=zone6Map(high);assert.equal(map[3][17],'j');assert.equal(map[10][12],'v');assert.equal(zone6Visible(high,'a').species,25);assert.equal(zone6Visible(high,'a').alpha,true);assert.equal(zone6Item(high,'i').id,'roof-luxury');
 assert.equal(zone6Item({...high,zaZone6Items:['roof-luxury']},'i'),null);const saved=restoreAdventurePosition(storeAdventurePosition(high,72),72);assert.deepEqual([saved.zaZone6Layer,saved.x,saved.y],['high',17,4]);
});

test('Zone 6 north exit connects Jaune Sector 11 and restores its position',()=>{
 const zone={area:3,district:'lumiose-zone6',interior:null,x:15,y:1,zaZone6Layer:'ground',teamIds:['kept']};
 const road=stepField(zone,'up');assert.deepEqual([road.district,road.x,road.y],['lumiose-jaune-sector11',11,15]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...road},61),61);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector11',11,15,['kept']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y,back.zaZone6Layer],['lumiose-zone6',15,1,'ground']);
 assert.ok(fieldPath(zone6Map({...zone,...back}),back,{x:11,y:15}).length);
});

test('Jaune Sector 11 connects its neighbouring streets and sector',()=>{
 const s={area:3,district:'lumiose-jaune-sector11',interior:null,teamIds:['kept']};
 for(const [x,y,dir,district,reverse] of [[1,8,'left','lumiose-jaune-sector9','right'],[11,1,'up','lumiose-jaune-street','down'],[21,8,'right','lumiose-north-boulevard','down']]){
  const a=stepField({...s,x,y},dir);assert.equal(a.district,district);
  const saved=restoreAdventurePosition(storeAdventurePosition({...s,...a},62),62);assert.deepEqual(saved.teamIds,['kept']);
  const back=stepField(saved,reverse);assert.equal(back.district,'lumiose-jaune-sector11');
 }
});


test('Zone 6 southern canal approach crosses into the lower layer and preserves saves',()=>{
 const road={area:3,district:'lumiose-saison-canalside',interior:null,x:17,y:1,facing:'up',teamIds:['kept']};
 const lower=stepField(road,'up');assert.deepEqual([lower.district,lower.zaZone6Layer,lower.x,lower.y],['lumiose-zone6','canal',3,15]);
 const state={...road,...lower};assert.ok(fieldPath(zone6Map(state),state,{x:3,y:6}).length);
 assert.equal(zone6Map(state)[16][3],'X');assert.notEqual(zone6Map({...state,zaZone6Layer:'ground'})[16][3],'X');
 const saved=restoreAdventurePosition(storeAdventurePosition({...state,zaZone6Items:['canal-potion']},63),63);
 assert.deepEqual([saved.district,saved.zaZone6Layer,saved.x,saved.y,saved.teamIds,saved.zaZone6Items],['lumiose-zone6','canal',3,15,['kept'],['canal-potion']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-saison-canalside',17,1]);
 assert.ok(fieldPath(fieldMap({...saved,...back}),back,{x:5,y:1}).length);
});

test('North Boulevard and Zone 6 connect both ways without invalidating old saves',()=>{
 const road={area:3,district:'lumiose-north-boulevard',interior:null,x:18,y:1,facing:'up',teamIds:['kept'],zaRoyaleRank:'F'};
 const toZone=stepField(road,'up');assert.deepEqual([toZone.district,toZone.zaZone6Layer,toZone.x,toZone.y],['lumiose-zone6','ground',14,1]);
 const inZone={...road,...toZone};assert.ok(fieldPath(zone6Map(inZone),inZone,{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(inZone,75),75);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone6',14,1,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y],['lumiose-north-boulevard',18,1]);
 const old={...road,district:'lumiose-zone6',x:11,y:10,zaZone6Layer:'ground'};
 const restored=restoreAdventurePosition(storeAdventurePosition(old,76),76);
 assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone6',11,10]);
});

test('Zone 6 ground canal reaches both screen edges without opening an exit',()=>{
 const ground=zone6Map({});for(const y of [9,10,11,12]){assert.equal(ground[y][0],'~');assert.equal(ground[y][22],'~');assert.equal(ground[y][11],';');}
 assert.equal(stepField({area:3,district:'lumiose-zone6',x:1,y:10},'left').blocked,true);
 assert.equal(stepField({area:3,district:'lumiose-zone6',x:21,y:10},'right').blocked,true);
});
