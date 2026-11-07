import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone18Map,zone18Visible,zone18Encounter} from '../lib/cloud-adventure/adventure-zone18.mjs';
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
