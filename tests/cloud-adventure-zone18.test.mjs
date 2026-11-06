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
 const sector=stepField({...road,x:21,y:8},'right');assert.equal(sector.district,'lumiose-magenta-sector9');
 assert.equal(stepField({...road,...sector},'left').district,'lumiose-autumnal-approach');
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

test('Zone 18 roadside dragon and scaffold alpha use separate levels',()=>{
 const ground={area:3,district:'lumiose-zone18',interior:null,x:11,y:8,zaRoyaleRank:'B'};
 const upper={...ground,zaZone18Upper:true,x:6,y:9};
 assert.equal(zone18Visible(ground,'b').species,373);assert.equal(zone18Visible(ground,'c'),null);
 assert.equal(zone18Visible(upper,'c').species,428);assert.equal(zone18Visible(upper,'b'),null);
 assert.ok(fieldPath(fieldMap(upper),upper,{x:12,y:6}).length);
 assert.equal(zone18Visible({...upper,zaZone18Spent:{'lopunny-alpha':true}},'c'),null);
 const legacy=restoreAdventurePosition(storeAdventurePosition({...upper,x:12,y:5},38),38);
 assert.equal(legacy.district,'lumiose-zone18');assert.equal(legacy.zaZone18Upper,true);assert.ok([11,12,13].includes(legacy.x));assert.ok(fieldMap(legacy)[legacy.y][legacy.x]!== 'c');
 const restored=restoreAdventurePosition(storeAdventurePosition(upper,38),38);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone18Upper],['lumiose-zone18',6,9,true]);
});
