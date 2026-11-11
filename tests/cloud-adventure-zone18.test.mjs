import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone18Map,zone18Visible,zone18Encounter,ZONE18_SCAFFOLD} from '../lib/cloud-adventure/adventure-zone18.mjs';

test('Zone 18 rooftop birds follow the server period and preserve old positions',()=>{
 const base={area:3,district:'lumiose-zone18',interior:null,zaRoyaleRank:'B',zaZone18Upper:true,teamIds:['kept']};
 for(const [period,species] of [['day',[333,334]],['night',[714,715]]]){
  const s={...base,zaZone18Period:period};
  for(const [index,tile] of ['e','f'].entries()){
   const mon=zone18Visible(s,tile);assert.equal(mon.species,species[index]);assert.equal(zone18Map(s)[mon.y][mon.x],tile);
   assert.equal(fieldDialogue({...s,x:mon.x,y:mon.y+1,facing:'up'}).action,`zone18Wild-${mon.id}`);
   assert.equal(zone18Visible({...s,zaZone18Spent:{[mon.id]:true}},tile),null);
   const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:mon.x,y:mon.y},37),37);
   assert.deepEqual([saved.x,saved.y,saved.teamIds],[mon.x,mon.y,['kept']]);
  }
 }
 assert.equal(zone18Visible({...base,zaZone18Upper:false,zaZone18Period:'day'},'e'),null);
});

test('Zone 18 courtyard west exit connects to the outside scaffold and preserves saves',()=>{
 const courtyard={area:3,district:'lumiose-zone18',interior:null,x:1,y:12,zaRoyaleRank:'B',zaZone18Construction:true,zaZone18Upper:false,teamIds:['kept']};
 assert.equal(zone18Map(courtyard)[12][0],'X');
 const street=stepField(courtyard,'left');assert.deepEqual([street.district,street.x,street.y],['lumiose-magenta-sector9',21,12]);
 const outside={...courtyard,...street,zaZone18Construction:false};const map=fieldMap(outside);
 assert.ok(fieldPath(map,outside,{x:14,y:14}).length);assert.equal(map[13][14],'l');
 const saved=restoreAdventurePosition(storeAdventurePosition(outside,40),40);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector9',21,12,['kept']]);
 assert.equal(stepField({...saved,zaRoyaleRank:'C'},'right').blocked,true);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y,back.zaZone18Construction],['lumiose-zone18',1,12,true]);
 const restored=restoreAdventurePosition(storeAdventurePosition({...saved,...back},41),41);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone18Construction],['lumiose-zone18',1,12,true]);
 assert.ok(fieldPath(fieldMap(restored),restored,{x:16,y:6}).length);
});

test('Zone 18 north and southeast approaches preserve ground and rooftop saves',()=>{
 const s={area:3,district:'lumiose-zone18',interior:null,zaRoyaleRank:'B',teamIds:['kept']},map=zone18Map(s);
 for(let y=1;y<=4;y++)for(let x=10;x<=12;x++)assert.equal(map[y][x],',');
 for(let x=12;x<=20;x++)assert.equal(map[15][x],',');
 assert.equal(map[8][8],'a');assert.equal(map[13][14],'l');assert.equal(map[12][16],'#');
 assert.ok(fieldPath(map,{x:11,y:1},{x:20,y:15}).length);
 for(const [x,y] of [[11,1],[20,15]]){
  const restored=restoreAdventurePosition(storeAdventurePosition({...s,x,y},106),106);
  assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[s.district,x,y,['kept']]);
 }
 assert.equal(zone18Map({...s,zaZone18Upper:true})[1][11],'#');
});
test('zone eighteen gate, road and saved position',()=>{
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:2,y:1,facing:'up',zaRoyaleRank:'C'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'B'},'up');assert.equal(entered.district,'lumiose-zone18');
 const s={...base,...entered,zaRoyaleRank:'B'};assert.ok(fieldPath(zone18Map(s),s,{x:7,y:8}).length);assert.equal(zone18Visible(s,'a').species,371);assert.equal(zone18Encounter(s,()=>0).speciesId,371);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:7,y:8},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone18',7,8]);assert.equal(stepField(s,'left').district,'lumiose-north-boulevard');
});
test('Zone 18 south gate connects Magenta Sector 9 and Quasartico',()=>{
 const zone={area:3,district:'lumiose-zone18',interior:null,x:11,y:15,zaRoyaleRank:'B',teamIds:['kept']};
 const sector=stepField(zone,'down');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector9',11,1]);
 assert.equal(stepField({...zone,...sector,zaRoyaleRank:'C'},'up').blocked,true);
 assert.equal(stepField({...zone,...sector},'up').district,'lumiose-zone18');
 const office=stepField({...zone,...sector,x:11,y:15},'down');assert.equal(office.district,'lumiose-quasartico');
 assert.equal(stepField({...zone,...office},'up').district,'lumiose-magenta-sector9');
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...sector},34),34);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector9',11,1,['kept']]);
});
test('Autumnal Avenue connects Centrico, Magenta Sector 9 and Zone 18',()=>{
 const road={area:3,district:'lumiose-autumnal-approach',interior:null,x:11,y:1,zaRoyaleRank:'C',teamIds:['kept']};
 assert.equal(stepField(road,'up').blocked,true);
 const zone=stepField({...road,zaRoyaleRank:'B'},'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone18',11,1]);
 assert.equal(stepField({...road,...zone,zaRoyaleRank:'B'},'up').district,'lumiose-autumnal-approach');
 const sector=stepField({...road,x:1,y:12},'left');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector9',21,8]);
 assert.equal(stepField({...road,...sector},'right').district,'lumiose-autumnal-approach');
 const centrico=stepField({...road,x:11,y:15},'down');assert.equal(centrico.district,'lumiose-centrico-route');
 assert.equal(stepField({...road,...centrico},'up').district,'lumiose-autumnal-approach');
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,x:11,y:8},35),35);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-autumnal-approach',11,8,['kept']]);
});

test('Autumnal Avenue and North Boulevard connect both ways and preserve saves',()=>{
 const road={area:3,district:'lumiose-autumnal-approach',interior:null,x:1,y:8,zaRoyaleRank:'C',teamIds:['kept']};
 const boulevard=stepField(road,'left');assert.deepEqual([boulevard.district,boulevard.x,boulevard.y],['lumiose-north-boulevard',9,1]);
 const restored=restoreAdventurePosition(storeAdventurePosition({...road,...boulevard},36),36);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-north-boulevard',9,1,['kept']]);
 const returned=stepField(restored,'up');assert.deepEqual([returned.district,returned.x,returned.y],['lumiose-autumnal-approach',1,8]);
 assert.ok(fieldPath(fieldMap(road),{x:1,y:8},{x:11,y:15}).length);
});

test('Zone 18 southeast alley reaches Quasartico and keeps rank and saved state',()=>{
 const zone={area:3,district:'lumiose-zone18',interior:null,x:20,y:15,zaRoyaleRank:'B',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(zone),{x:11,y:8},{x:20,y:15}).length);
 const office=stepField(zone,'down');assert.deepEqual([office.district,office.x,office.y],['lumiose-quasartico',20,1]);
 assert.equal(stepField({...zone,...office,zaRoyaleRank:'C'},'up').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...office},37),37);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-quasartico',20,1,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y,back.zaZone18Upper],['lumiose-zone18',20,15,false]);
});

test('Zone 18 scaffold alley leads to the ladder and preserves roof saves',()=>{
 const ground={area:3,district:'lumiose-zone18',interior:null,x:11,y:8,zaRoyaleRank:'B'};
 const upper={...ground,zaZone18Upper:true,x:6,y:9};
 assert.equal(zone18Visible(ground,'b').species,373);assert.equal(zone18Visible(ground,'c').species,428);
 assert.equal(zone18Visible(upper,'c'),null);assert.equal(zone18Visible(upper,'b'),null);
 assert.ok(fieldPath(fieldMap(ground),ground,{x:13,y:6}).length);
 assert.equal(zone18Visible({...ground,zaZone18Spent:{'lopunny-alpha':true}},'c'),null);
 const oldGround=restoreAdventurePosition(storeAdventurePosition({...ground,x:12,y:5},38),38);assert.equal(oldGround.district,'lumiose-zone18');assert.notDeepEqual([oldGround.x,oldGround.y],[12,5]);
 const restored=restoreAdventurePosition(storeAdventurePosition({...upper,x:12,y:5},38),38);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone18Upper],['lumiose-zone18',12,5,true]);
});

test('Autumnal Avenue reaches Quasartico and preserves existing mission state',()=>{
 const s={area:3,district:'lumiose-autumnal-approach',interior:null,x:1,y:4,zaMission10Stage:3,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(s),{x:11,y:8},s).length);
 const office=stepField(s,'left');assert.deepEqual([office.district,office.x,office.y],['lumiose-quasartico',21,4]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...office},57),57);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission10Stage,saved.teamIds],['lumiose-quasartico',21,4,3,['kept']]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-autumnal-approach',1,4]);
});

test('Zone 18 opposing roofs keep the scaffold and migrate earlier roof saves',()=>{
 const base={area:3,district:'lumiose-zone18',interior:null,x:11,y:5,zaZone18Upper:true,regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone18Map(base);
 assert.equal(map[5][11],'#');assert.ok(fieldPath(map,{x:6,y:9},{x:16,y:6}).length);
 const saved=storeAdventurePosition(base,7);delete saved.districtPosition.splitRoofLayout;const restored=restoreAdventurePosition(structuredClone(saved),7);
 assert.equal(restored.district,base.district);assert.equal(restored.zaZone18Upper,true);assert.notEqual(map[restored.y][restored.x],'#');assert.deepEqual(restored.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);
});

test('Zone 18 south scaffold and legacy ladder remain reachable',()=>{
 const s={area:3,district:'lumiose-zone18',interior:null,x:11,y:15,zaRoyaleRank:'B'};const map=zone18Map(s);
 assert.equal(map[13][14],'l');assert.equal(map[5][13],'l');assert.ok(fieldPath(map,s,{x:13,y:13}).length);assert.ok(fieldPath(map,s,{x:13,y:6}).length);
 const old=storeAdventurePosition({...s,x:14,y:13},34);const restored=restoreAdventurePosition(old,34);assert.deepEqual([restored.district,restored.x,restored.y],[s.district,14,13]);
});

test('Sector 9 outside scaffold keeps the street walkable and older positions',()=>{
 const street={area:3,district:'lumiose-magenta-sector9',interior:null,x:13,y:13,facing:'right',zaRoyaleRank:'B',teamIds:['kept']};
 const map=fieldMap(street);assert.equal(map[13][14],'l');assert.ok(fieldPath(map,street,{x:11,y:1}).length);
 const old=restoreAdventurePosition(storeAdventurePosition({...street,x:14},48),48);assert.deepEqual([old.district,old.x,old.y,old.teamIds],[street.district,14,13,['kept']]);
});


test('outside roof and Zone 18 rooftop gate preserve layer and rank',()=>{
 const outside={area:3,district:'lumiose-magenta-sector9',interior:null,x:11,y:1,zaMagenta9Upper:true,zaRoyaleRank:'C',teamIds:['kept']};
 assert.equal(stepField(outside,'up').blocked,true);const entered=stepField({...outside,zaRoyaleRank:'B'},'up');
 assert.deepEqual([entered.district,entered.x,entered.y,entered.zaZone18Upper],['lumiose-zone18',1,8,true]);
 const state={...outside,...entered,zaRoyaleRank:'B'};const saved=restoreAdventurePosition(storeAdventurePosition(state,99),99);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone18Upper,saved.teamIds],['lumiose-zone18',1,8,true,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y,back.zaMagenta9Upper],['lumiose-magenta-sector9',11,1,true]);
 const resumed=restoreAdventurePosition(storeAdventurePosition({...saved,...back},100),100);assert.deepEqual([resumed.x,resumed.y,resumed.zaMagenta9Upper],[11,1,true]);
});

test('second Zone 18 rooftop gate round trips near the eastern roof',()=>{
 const roof={area:3,district:'lumiose-zone18',interior:null,x:21,y:8,zaZone18Upper:true,zaRoyaleRank:'B',teamIds:['kept'],zaZone18Items:['roof-quick']};
 const map=fieldMap(roof);assert.equal(map[8][22],'E');assert.ok(fieldPath(map,roof,{x:16,y:8}).length);
 const out=stepField(roof,'right');assert.deepEqual([out.district,out.x,out.y,out.zaZone18Upper,out.zaMagenta9Upper],['lumiose-magenta-sector9',21,8,false,true]);
 const external={...roof,...out},saved=restoreAdventurePosition(storeAdventurePosition(external,142),142);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMagenta9Upper,saved.teamIds,saved.zaZone18Items],[external.district,21,8,true,['kept'],['roof-quick']]);
 assert.equal(stepField({...saved,zaRoyaleRank:'C'},'right').blocked,true);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y,back.zaZone18Upper],['lumiose-zone18',21,8,true]);
 const resumed=restoreAdventurePosition(storeAdventurePosition({...saved,...back},143),143);assert.deepEqual([resumed.district,resumed.x,resumed.y,resumed.zaZone18Upper],['lumiose-zone18',21,8,true]);
 assert.equal(zone18Map({...roof,zaZone18Upper:false})[8][22],'E');
});

test('draft scaffold courtyard preserves access and older ground saves',()=>{
 const s={area:3,district:'lumiose-zone18',interior:null,x:11,y:8,zaRoyaleRank:'B',teamIds:['kept'],zaZone18Items:['roof-quick']},map=zone18Map(s);
 for(const [x,y] of ZONE18_SCAFFOLD)assert.equal(map[y][x],'^');
 for(const point of [{x:11,y:1},{x:13,y:6},{x:20,y:15},{x:11,y:15},{x:1,y:8},{x:21,y:8}])assert.ok(fieldPath(map,s,point).length);
 for(const [x,y] of ZONE18_SCAFFOLD){const old=storeAdventurePosition({...s,x,y},98);delete old.districtPosition.zone18ScaffoldLayout;const restored=restoreAdventurePosition(old,98);assert.equal(restored.district,s.district);assert.notEqual(map[restored.y][restored.x],'^');assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone18Items,['roof-quick']);assert.equal(restoreAdventurePosition(old,99).district,null);}
 const saved=storeAdventurePosition({...s,x:10,y:2},99);assert.equal(saved.districtPosition.zone18ScaffoldLayout,1);const restored=restoreAdventurePosition(saved,99);assert.deepEqual([restored.x,restored.y],[10,2]);
 assert.notEqual(zone18Map({...s,zaZone18Upper:true})[2][8],'^');
});
