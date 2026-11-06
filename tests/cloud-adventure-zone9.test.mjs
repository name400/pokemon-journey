import test from 'node:test';
import assert from 'node:assert/strict';
import {zone9Map,zone9Encounter,zone9Visible,zone9Item} from '../lib/cloud-adventure/adventure-zone9.mjs';
import {stepField,fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone nine entry and rooftop keep saved positions',()=>{
 const base={area:3,district:'lumiose-estival-approach',interior:null,x:21,y:12,facing:'right',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'right').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'right');assert.equal(entered.district,'lumiose-zone9');
 const s={...base,...entered,zaRoyaleRank:'F'},ground=zone9Map(s);assert.ok(fieldPath(ground,s,{x:5,y:6}).length);assert.equal(zone9Visible(s,'a').species,302);
 const roof={...s,zaZone9Upper:true,x:5,y:6},map=zone9Map(roof);assert.ok(fieldPath(map,roof,{x:17,y:12}).length);assert.equal(zone9Visible(roof,'b').species,303);assert.equal(zone9Visible(roof,'d').species,703);assert.equal(zone9Visible(roof,'v').alpha,true);assert.equal(zone9Item(roof,'j').kind,'healball');assert.equal(zone9Item({...roof,zaZone9Items:['north-heal']},'j'),null);
 const restored=restoreAdventurePosition(storeAdventurePosition(roof,42),42);assert.deepEqual([restored.district,restored.zaZone9Upper,restored.x,restored.y],['lumiose-zone9',true,5,6]);assert.equal(stepField(s,'down').district,'lumiose-estival-approach');assert.equal(zone9Encounter(roof,()=>0).speciesId,703);
});
test('Zone 9 connects Estival Avenue while retaining rank and rooftop boundaries',()=>{
 const road={area:3,district:'lumiose-estival-approach',interior:null,x:21,y:8,zaRoyaleRank:'V',teamIds:['kept']};
 assert.equal(stepField(road,'right').blocked,true);
 const zone=stepField({...road,zaRoyaleRank:'F'},'right');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone9',15,15]);
 assert.equal(stepField({...road,...zone,zaRoyaleRank:'F'},'down').district,'lumiose-estival-approach');
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...zone,zaRoyaleRank:'F'},31),31);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone9',15,15,['kept']]);
});
test('Zone 9 north gate links Magenta Sector 6 and the canal route',()=>{
 const z={area:3,district:'lumiose-zone9',interior:null,x:11,y:1,zaRoyaleRank:'F',teamIds:['kept']};
 const sector=stepField(z,'up');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector6',11,15]);
 assert.equal(stepField({...z,...sector},'down').district,'lumiose-zone9');
 assert.equal(stepField({...z,...sector,zaRoyaleRank:'V'},'down').blocked,true);
 const canal=stepField({...z,...sector,x:11,y:1},'up');assert.equal(canal.district,'lumiose-magenta-canal-route');
 assert.equal(stepField({...z,...canal},'left').district,'lumiose-magenta-sector6');
 const saved=restoreAdventurePosition(storeAdventurePosition({...z,...sector,x:11,y:7},32),32);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector6',11,7,['kept']]);
});
test('Zone 9 east gate and Magenta Sector 6 both connect Sector 3',()=>{
 const z={area:3,district:'lumiose-zone9',interior:null,x:21,y:8,zaRoyaleRank:'F',teamIds:['kept']};
 const sector=stepField(z,'right');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector3',1,12]);
 assert.equal(stepField({...z,...sector,zaRoyaleRank:'V'},'left').blocked,true);
 assert.equal(stepField({...z,...sector},'left').district,'lumiose-zone9');
 const six=stepField({...z,...sector,x:1,y:8},'left');assert.equal(six.district,'lumiose-magenta-sector6');
 assert.equal(stepField({...z,...six},'right').district,'lumiose-magenta-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...z,...sector},33),33);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector3',1,12,['kept']]);
});

test('Centrico access routes through Estival before reaching the second south gate',()=>{
 const s={area:3,district:'lumiose-centrico-route',interior:null,x:2,y:1,zaRoyaleRank:'V',teamIds:['kept']};
 const road=stepField(s,'up');assert.deepEqual([road.district,road.x,road.y],['lumiose-estival-approach',21,12]);
 assert.equal(stepField({...s,...road},'right').blocked,true);
 const zone=stepField({...s,...road,zaRoyaleRank:'F'},'right');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone9',11,15]);
 assert.equal(stepField({...s,...zone,zaRoyaleRank:'F'},'down').district,'lumiose-estival-approach');
});

test('Magenta Sector 3 and Autumnal Avenue connect in both directions',()=>{
 const sector={area:3,district:'lumiose-magenta-sector3',interior:null,x:21,y:8,zaRoyaleRank:'V',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(sector),{x:4,y:1},sector).length);
 const avenue=stepField(sector,'right');assert.deepEqual([avenue.district,avenue.x,avenue.y],['lumiose-autumnal-approach',1,6]);
 assert.ok(fieldPath(fieldMap({...sector,...avenue}),avenue,{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,...avenue},34),34);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-autumnal-approach',1,6,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector3',21,8]);
});
test('Magenta Sector 6 connects west to South Boulevard without bypassing Zone 9',()=>{
 const sector={area:3,district:'lumiose-magenta-sector6',interior:null,x:1,y:8,zaRoyaleRank:'V',zaMission10Stage:3,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(sector),sector,{x:11,y:15}).length);
 assert.equal(stepField({...sector,x:11,y:15},'down').blocked,true);
 const road=stepField(sector,'left');assert.deepEqual([road.district,road.x,road.y],['lumiose-south-boulevard',21,12]);
 assert.ok(fieldPath(fieldMap({...sector,...road}),road,{x:15,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,...road},35),35);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission10Stage,saved.teamIds],['lumiose-south-boulevard',21,12,3,['kept']]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector6',1,8]);
});
