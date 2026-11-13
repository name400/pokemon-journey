import test from 'node:test';
import assert from 'node:assert/strict';
import {zone6Map,zone6Encounter,zone6Layer,zone6Visible,zone6Item,ZONE6_CAFE_FOOTPRINT,ZONE6_MARKET_STALLS} from '../lib/cloud-adventure/adventure-zone6.mjs';

test('Zone 6 market stalls preserve older positions and the cafe approach',()=>{
 const base={area:3,district:'lumiose-zone6',interior:null,zaZone6Layer:'ground',teamIds:['kept'],zaZone6Items:['south-potion']},map=zone6Map(base);
 for(const [x,y] of ZONE6_MARKET_STALLS){assert.equal(map[y][x],'%');const old=storeAdventurePosition({...base,x,y},140);delete old.districtPosition.zone6MarketLayout;const restored=restoreAdventurePosition(old,140);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'%');assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone6Items,['south-potion']);}
 assert.ok(fieldPath(map,{x:11,y:15},{x:18,y:3}).length);assert.equal(map[3][8],'e');assert.equal(map[4][7],'g');
 assert.equal(storeAdventurePosition({...base,x:11,y:15},140).districtPosition.zone6MarketLayout,1);
});
import {stepField,storeAdventurePosition,restoreAdventurePosition,fieldPath,fieldMap,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 6 ground approaches connect the bridge to gates without altering grass or saves',()=>{
 const s={area:3,district:'lumiose-zone6',interior:null,regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone6Map(s);
 for(const y of [1,2,3,4,5,6,7,8,13,14,15])for(const x of [10,11,12])assert.equal(map[y][x],',');
 for(let x=10;x<=15;x++)assert.equal(map[1][x],',');
 for(let x=10;x<=18;x++)assert.equal(map[15][x],',');
 for(let y=9;y<=12;y++)assert.equal(map[y][11],';');
 assert.equal(map[4][4],'g');assert.equal(map[5][6],'a');assert.equal(map[14][19],'i');
 for(const [x,y] of [[10,1],[15,1],[10,15],[18,15]]){
  const old=restoreAdventurePosition(storeAdventurePosition({...s,x,y},101),101);
  assert.deepEqual([old.district,old.x,old.y,old.teamIds],[s.district,x,y,['kept']]);
 }
 assert.ok(fieldPath(map,{x:11,y:1},{x:11,y:15}).length);
 assert.equal(zone6Map({...s,zaZone6Layer:'canal'})[9][11],'w');
});

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
 const second=stepField({...road,x:18},'up');assert.deepEqual([second.district,second.zaZone6Layer,second.x,second.y],['lumiose-zone6','canal',5,15]);assert.ok(fieldPath(zone6Map({...road,...second}),second,{x:11,y:8}).length);const secondSaved=restoreAdventurePosition(storeAdventurePosition({...road,...second,zaZone6Items:['canal-potion']},64),64);assert.deepEqual([secondSaved.x,secondSaved.y,secondSaved.zaZone6Layer,secondSaved.zaZone6Items],[5,15,'canal',['canal-potion']]);const secondBack=stepField(secondSaved,'down');assert.deepEqual([secondBack.district,secondBack.x,secondBack.y],['lumiose-saison-canalside',18,1]);assert.notEqual(zone6Map({...state,zaZone6Layer:'ground'})[16][5],'X');
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

test('Zone 6 second southern gate connects Jaune Sector 12 and preserves both routes',()=>{
 const zone={area:3,district:'lumiose-zone6',interior:null,x:16,y:15,facing:'down',zaZone6Layer:'ground',teamIds:['kept']};
 const street=stepField(zone,'down');assert.deepEqual([street.district,street.x,street.y],['lumiose-jaune-sector12',15,1]);
 const state={...zone,...street};assert.ok(fieldPath(fieldMap(state),state,{x:11,y:1}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,78),78);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector12',15,1,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y,back.zaZone6Layer],['lumiose-zone6',16,15,'ground']);
 assert.equal(stepField({...zone,x:18},'down').district,'lumiose-jaune-sector12');
 assert.equal(stepField({...zone,zaZone6Layer:'roof'},'down').blocked,true);
});

test('draft café footprint preserves ground paths and older saves',()=>{
 const base={area:3,district:'lumiose-zone6',interior:null,zaZone6Layer:'ground',x:11,y:8,teamIds:['kept'],zaZone6Items:['south-potion']},map=zone6Map(base);
 for(const [x,y] of ZONE6_CAFE_FOOTPRINT)assert.equal(map[y][x],'%');
 for(const point of [{x:17,y:3},{x:18,y:4},{x:20,y:4},{x:11,y:1},{x:11,y:15}])assert.ok(fieldPath(map,base,point).length);
 for(const [x,y] of ZONE6_CAFE_FOOTPRINT){const old=storeAdventurePosition({...base,x,y},93);delete old.districtPosition.zone6CafeLayout;const restored=restoreAdventurePosition(old,93);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'%');assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone6Items,['south-potion']);assert.equal(restoreAdventurePosition(old,94).district,null);}
 const saved=storeAdventurePosition({...base,x:17,y:3},95);assert.equal(saved.districtPosition.zone6CafeLayout,1);const restored=restoreAdventurePosition(saved,95);assert.deepEqual([restored.x,restored.y],[17,3]);
 assert.notEqual(zone6Map({...base,zaZone6Layer:'high'})[1][18],'%');
});

test('Zone 6 café roof overlaps its ground footprint and preserves high-layer saves',()=>{
 const ground={area:3,district:'lumiose-zone6',interior:null,zaZone6Layer:'ground',teamIds:['kept']},roof={...ground,zaZone6Layer:'high',x:18,y:3},below=zone6Map(ground),above=zone6Map(roof);
 for(let y=1;y<=2;y++)for(let x=17;x<=19;x++){assert.equal(below[y][x],'%');assert.equal(above[y][x],'.');assert.ok(fieldPath(above,roof,{x,y}).length);}
 assert.equal(above[3][17],'j');assert.equal(above[10][12],'v');assert.equal(zone6Visible(roof,'a').species,25);
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:18,y:2},139),139);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone6Layer,saved.teamIds],[ground.district,18,2,'high',['kept']]);
});


test('Zone 6 shallow underpass aligns with the bridge and preserves saved layers',()=>{
 const ground={area:3,district:'lumiose-zone6',interior:null,x:11,y:10,zaZone6Layer:'ground',teamIds:['kept']};
 const canal={...ground,zaZone6Layer:'canal',x:11,y:7},above=fieldMap(ground),below=fieldMap(canal);
 for(let y=9;y<=11;y++){assert.equal(above[y][11],';');assert.equal(below[y][11],'w');}
 assert.equal(below[8][12],'a');assert.equal(stepField({...canal,x:12},'down').blocked,true);
 assert.equal(stepField(canal,'down').y,8);assert.ok(fieldPath(below,canal,{x:11,y:12}).length);
 for(const value of [ground,{...canal,x:11,y:10}]){const s=restoreAdventurePosition(storeAdventurePosition(value,121),121);assert.deepEqual([s.district,s.zaZone6Layer,s.x,s.y,s.teamIds],[value.district,value.zaZone6Layer,value.x,value.y,['kept']]);}
});
test('Zone 6 ground court shows Meditite only by day',()=>{
 const day={area:3,district:'lumiose-zone6',zaZone6Period:'day'},night={...day,zaZone6Period:'night'};
 assert.equal(zone6Visible(day,'b').species,307);assert.equal(zone6Map(day)[5][15],'b');assert.equal(zone6Visible(night,'b'),null);assert.equal(zone6Map(night)[5][15],'g');
 for(const r of [0,.1,.3,.5,.7,.9,.999])assert.notEqual(zone6Encounter(()=>r,'night').speciesId,307);
 assert.equal(zone6Encounter(()=>.5,'day').speciesId,307);
});

test('source-based lift and ladder keep both roof layers and old saved positions',()=>{
 const ground={area:3,district:'lumiose-zone6',interior:null,x:15,y:7,facing:'right',teamIds:['kept']};
 const roof={...ground,zaZone6Layer:'roof'},high={...ground,zaZone6Layer:'high'};
 assert.equal(fieldDialogue(ground).action,'zone6FlaaffyLift');assert.equal(fieldDialogue(roof).action,'zone6FlaaffyLift');
 assert.equal(fieldDialogue({...ground,x:18}).action,'zone6PikachuLadder');assert.equal(fieldDialogue(high).action,'zone6PikachuLadder');
 assert.ok(fieldPath(fieldMap(roof),roof,{x:7,y:6}).length);assert.ok(fieldPath(fieldMap(high),high,{x:10,y:6}).length);
 for(const state of [{...ground,x:16},{...ground,x:19},{...roof,x:16},{...high,x:16}]){
  const restored=restoreAdventurePosition(storeAdventurePosition(state,151),151);
  assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone6Layer,restored.teamIds],[state.district,state.x,state.y,state.zaZone6Layer,['kept']]);
 }
});
